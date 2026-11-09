export type SovereignTier = "free" | "pro" | "sovereign" | "admin";

export interface SessionContext {
  valid: boolean;
  userId: string;
  role: string;
  tier: SovereignTier;
  permissions: string[];
}

const TIER_HIERARCHY: Record<SovereignTier, number> = {
  free: 1,
  pro: 2,
  sovereign: 3,
  admin: 4,
};

const EMPTY_SESSION: SessionContext = {
  valid: false,
  userId: "",
  role: "guest",
  tier: "free",
  permissions: [],
};

function decodeBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("Invalid base64url value");
  }
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function defaultPermissions(tier: SovereignTier): string[] {
  switch (tier) {
    case "admin":
      return ["*"];
    case "sovereign":
      return [
        "telemetry:read",
        "telemetry:write",
        "sports:forecast",
        "games:execute",
        "cluster:manage",
      ];
    case "pro":
      return [
        "telemetry:read",
        "telemetry:write",
        "sports:forecast",
        "games:execute",
      ];
    case "free":
      return ["telemetry:read"];
  }
}

export async function verifySovereignSession(
  cookieHeader: string | null,
  secret: string
): Promise<SessionContext> {
  if (!secret || secret.trim() === "") {
    throw new Error("HMAC_SECRET environment binding is missing or unset.");
  }
  if (!cookieHeader) return { ...EMPTY_SESSION };

  const token = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("sovereign_session="))
    ?.slice("sovereign_session=".length);
  if (!token) return { ...EMPTY_SESSION };

  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    return { ...EMPTY_SESSION };
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  try {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    const header = JSON.parse(decoder.decode(decodeBase64Url(encodedHeader))) as {
      alg?: unknown;
    };
    if (header.alg !== "HS256") return { ...EMPTY_SESSION };

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const validSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );
    if (!validSignature) return { ...EMPTY_SESSION };

    const payload = JSON.parse(
      decoder.decode(decodeBase64Url(encodedPayload))
    ) as {
      sub?: unknown;
      role?: unknown;
      tier?: unknown;
      permissions?: unknown;
      exp?: unknown;
    };

    const now = Math.floor(Date.now() / 1000);
    if (
      typeof payload.sub !== "string" ||
      payload.sub.length === 0 ||
      typeof payload.role !== "string" ||
      typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= now
    ) {
      return { ...EMPTY_SESSION };
    }

    const validTiers: SovereignTier[] = ["free", "pro", "sovereign", "admin"];
    const tier = payload.tier === undefined ? "free" : payload.tier;
    if (typeof tier !== "string" || !validTiers.includes(tier as SovereignTier)) {
      return { ...EMPTY_SESSION };
    }

    let permissions = defaultPermissions(tier as SovereignTier);
    if (payload.permissions !== undefined) {
      if (
        !Array.isArray(payload.permissions) ||
        !payload.permissions.every((permission) => typeof permission === "string")
      ) {
        return { ...EMPTY_SESSION };
      }
      permissions = payload.permissions;
    }

    return {
      valid: true,
      userId: payload.sub,
      role: payload.role,
      tier: tier as SovereignTier,
      permissions,
    };
  } catch {
    return { ...EMPTY_SESSION };
  }
}

export function requireMinimumTier(
  session: SessionContext,
  minTier: SovereignTier
): boolean {
  if (!session.valid) return false;
  return TIER_HIERARCHY[session.tier] >= TIER_HIERARCHY[minTier];
}

export function requirePermission(
  session: SessionContext,
  permission: string
): boolean {
  return (
    session.valid &&
    (session.permissions.includes("*") || session.permissions.includes(permission))
  );
}

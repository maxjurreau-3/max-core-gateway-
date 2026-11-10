import { Env } from "../types/env";
import { requirePermission, verifySovereignSession } from "../middleware/auth";

interface CloudflareRequest extends Request {
    cf?: { colo?: string };
}

export async function handleInternalHealthRequest(request: Request, env: Env): Promise<Response> {
    const timestamp = Date.now();
    const secret = env.HMAC_SECRET;

    if (!secret || secret.trim() === "") {
        return jsonResponse({
            success: false,
            status: "CRITICAL",
            node: "max-core-gateway",
            error: "Health diagnostics are unavailable.",
            timestamp,
        }, 503);
    }

    let session;
    try {
        session = await verifySovereignSession(request.headers.get("Cookie"), secret);
    } catch {
        return jsonResponse({ error: "Health diagnostics are unavailable." }, 503);
    }

    if (!requirePermission(session, "cluster:manage")) {
        return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const startTime = Date.now();
    let dbOperational = false;

    try {
        const dbCheck = await env.CORE_DB.prepare("SELECT 1 AS active").first<{ active: number }>();
        dbOperational = dbCheck?.active === 1;
    } catch {
        // Keep internal database errors out of the diagnostic response.
    }

    const status = dbOperational ? "OPERATIONAL" : "DEGRADED";
    const requestWithCf = request as CloudflareRequest;

    return jsonResponse({
        success: dbOperational,
        status,
        node: "max-core-gateway",
        subsystems: {
            d1_database: dbOperational ? "CONNECTED" : "DEGRADED",
            hmac_vault: "CONFIGURED",
            // No nonce registry is currently wired into the gateway, so do not claim it is active.
            nonce_registry: "UNVERIFIED",
        },
        diagnostics: {
            latency_ms: Date.now() - startTime,
            edge_region: requestWithCf.cf?.colo || "UNKNOWN",
        },
        timestamp: Date.now(),
    }, dbOperational ? 200 : 503);
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json; charset=UTF-8" },
    });
}

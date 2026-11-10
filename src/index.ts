import { Env } from "./types/env";
import { applySecurityHeaders } from "./middleware/security";
import { handleSubdomainRouting } from "./routes/router";
import { handleApiRequest } from "./routes/api";
import { renderPortalOS1Shell } from "./ui/portal-shell";

function hexToBytes(value: string): Uint8Array {
    const normalized = value.replace(/^0x/i, "");
    if (normalized.length % 2 !== 0) {
        throw new Error("Invalid hex signature");
    }

    const bytes = new Uint8Array(normalized.length / 2);
    for (let i = 0; i < normalized.length; i += 2) {
        bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16);
    }

    return bytes;
}

async function verifySignedRequest(request: Request, secret: string): Promise<boolean> {
    const timestamp = request.headers.get("x-timestamp");
    const nonce = request.headers.get("x-nonce");
    const signature = request.headers.get("x-signature");

    if (!timestamp || !nonce || !signature) {
        return false;
    }

    const parsedTimestamp = Number(timestamp);
    const now = Date.now();
    if (!Number.isFinite(parsedTimestamp) || Math.abs(now - parsedTimestamp) > 5 * 60 * 1000) {
        return false;
    }

    const payload = await request.clone().text();
    const signingInput = `${timestamp}.${nonce}.${payload}`;

    try {
        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );

        return crypto.subtle.verify(
            "HMAC",
            key,
            hexToBytes(signature),
            new TextEncoder().encode(signingInput)
        );
    } catch {
        return false;
    }
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        if (env.HMAC_SECRET && env.DEFAULT_IDENTITY_HANDLE && url.pathname.startsWith("/api/")) {
            const isVerified = await verifySignedRequest(request, env.HMAC_SECRET);
            if (!isVerified) {
                return new Response("Unauthorized", { status: 401 });
            }
        }

        // 1. Handle Subdomain Redirections & Apex Canonical Enforcement
        const redirectResponse = handleSubdomainRouting(url, env);
        if (redirectResponse) {
            return redirectResponse;
        }

        // 2. Handle System API Endpoints
        if (url.pathname.startsWith("/api/")) {
            const apiResponse = await handleApiRequest(request, url, env);
            return applySecurityHeaders(apiResponse.headers), apiResponse;
        }

        // 3. Render Portal-OS1 PWA Runtime Shell
        const htmlContent = renderPortalOS1Shell();
        const response = new Response(htmlContent, {
            headers: { "content-type": "text/html;charset=UTF-8" },
        });

        return applySecurityHeaders(response.headers), response;
    },
};

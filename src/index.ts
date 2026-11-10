import { Env } from "./types/env";
import { applySecurityHeaders } from "./middleware/security";
import { handleSubdomainRouting } from "./routes/router";
import { handleApiRequest } from "./routes/api";
import { renderPortalOS1Shell } from "./ui/portal-shell";

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

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

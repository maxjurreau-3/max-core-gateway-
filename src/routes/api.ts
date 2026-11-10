import { Env } from "../types/env";
import { handleInternalHealthRequest } from "./health";

export async function handleApiRequest(
    request: Request,
    url: URL,
    env: Env
): Promise<Response> {
    if (url.pathname === "/api/health") {
        return new Response(
            JSON.stringify({
                status: "online",
                system: "MAX-INSTITUTE APEX GATEWAY",
                environment: env.ENVIRONMENT,
                timestamp: new Date().toISOString(),
            }),
            {
                headers: { "content-type": "application/json" },
            }
        );
    }

    if (url.pathname === "/api/v1/internal/health") {
        return handleInternalHealthRequest(request, env);
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
    });
}

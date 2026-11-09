import { Env } from "../types/env";

export async function handleApiRequest(url: URL, env: Env): Promise<Response> {
    if (url.pathname === "/api/health") {
        return new Response(
            JSON.stringify({
                status: "online",
                system: "MAX-INSTITUTE APEX GATEWAY",
                environment: env.ENVIRONMENT,
                timestamp: new Date().toISOString()
            }),
            {
                headers: { "content-type": "application/json" }
            }
        );
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "content-type": "application/json" }
    });
}

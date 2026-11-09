import { Env } from "../types/env";

export function handleSubdomainRouting(url: URL, env: Env): Response | null {
    const path = url.pathname;

    if (url.hostname === `www.${env.APEX_DOMAIN}`) {
        url.hostname = env.APEX_DOMAIN;
        return Response.redirect(url.toString(), 301);
    }

    if (path.startsWith("/sports")) {
        const redirectUrl = new URL(url.toString());
        redirectUrl.hostname = `sports.${env.APEX_DOMAIN}`;
        redirectUrl.pathname = path.replace(/^\/sports/, "") || "/";
        return Response.redirect(redirectUrl.toString(), 302);
    }

    if (path.startsWith("/games")) {
        const redirectUrl = new URL(url.toString());
        redirectUrl.hostname = `games.${env.APEX_DOMAIN}`;
        redirectUrl.pathname = path.replace(/^\/games/, "") || "/";
        return Response.redirect(redirectUrl.toString(), 302);
    }

    return null;
}

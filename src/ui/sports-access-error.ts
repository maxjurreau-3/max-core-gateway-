export function renderSportsAccessError(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Sports Gateway | Authentication Required</title>
    <style>
        :root { color-scheme: dark; --bg: #090a0f; --accent: #ff007f; --text: #e0e6ed; --muted: #8892b0; }
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 1.25rem; box-sizing: border-box; background: var(--bg); color: var(--text); font: 14px/1.5 'Courier New', monospace; }
        main { width: min(100%, 720px); padding: 1.25rem; border: 1px solid #ff007f55; border-radius: 8px; box-sizing: border-box; }
        header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem 1rem; border-bottom: 1px solid #ff007f55; padding-bottom: 0.75rem; margin-bottom: 1rem; color: var(--accent); }
        .status { color: var(--accent); }
        p { margin: 0.5rem 0; color: var(--muted); }
        code { color: #fff; overflow-wrap: anywhere; }
        .headers { color: #00ffcc; }
        a { color: #00ffcc; }
        :focus-visible { outline: 2px solid #00ffcc; outline-offset: 3px; }
    </style>
</head>
<body>
    <main aria-labelledby="page-title">
        <header>
            <span id="page-title">MAX-QUANTUM SPORTS // TIER 3 GATEWAY</span>
            <span class="status" role="status">STATUS: AUTHENTICATION REQUIRED [401]</span>
        </header>
        <section aria-label="Authentication error details">
            <p>Error Code: <code>HMAC_SIGNATURE_MISMATCH_OR_EXPIRED_NONCE</code></p>
            <p>Action Required: Send a valid, current request signature with its timestamp and a unique nonce. Obtain these values through the authorized client integration; do not reuse expired or previously submitted nonces.</p>
            <p>Required headers: <code class="headers">X-Signature, X-Timestamp, X-Nonce</code></p>
            <p>This page explains an authentication failure; it does not generate credentials or indicate live gateway health.</p>
        </section>
    </main>
</body>
</html>`;
}

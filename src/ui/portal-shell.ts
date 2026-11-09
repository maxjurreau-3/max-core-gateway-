import { REGISTERED_SUBSPACES } from "../config/subdomains";

export function renderPortalOS1Shell(): string {
    const cardsHtml = REGISTERED_SUBSPACES.map(
        (space) => `
        <div class="card">
            <h3>${space.name}</h3>
            <p>${space.description}</p>
            <a href="${space.route}">Launch Space &rarr;</a>
        </div>
    `
    ).join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAX-INSTITUTE | Apex Gateway</title>
    <style>
        :root { --bg: #090a0f; --accent: #00ffcc; --text: #e0e6ed; --card-bg: #0d111a; --border: #1a233a; }
        body { background: var(--bg); color: var(--text); font-family: 'Courier New', monospace; margin: 0; padding: 3rem; }
        .header { border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; margin-bottom: 2rem; }
        h1 { color: var(--accent); margin: 0 0 0.5rem 0; letter-spacing: 2px; }
        .status { font-size: 0.85rem; color: #8b949e; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
        .card { border: 1px solid var(--border); padding: 1.5rem; border-radius: 6px; background: var(--card-bg); transition: 0.2s; }
        .card:hover { border-color: var(--accent); transform: translateY(-2px); }
        .card h3 { margin-top: 0; color: var(--text); }
        a { color: var(--accent); text-decoration: none; font-weight: bold; display: inline-block; margin-top: 1rem; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MAX-INSTITUTE // APEX GATEWAY</h1>
        <div class="status">System Status: Edge Operational &bull; Runtime: Portal-OS1</div>
    </div>
    <div class="grid">
        ${cardsHtml}
    </div>
</body>
</html>`;
}

CREATE TABLE IF NOT EXISTS system_registry_logs (
    log_id TEXT PRIMARY KEY,
    subdomain TEXT NOT NULL,
    client_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS node_gateways (
    gateway_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    route_pattern TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

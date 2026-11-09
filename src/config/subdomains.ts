export interface SubspaceConfig {
    name: string;
    subdomain: string;
    description: string;
    route: string;
}

export const REGISTERED_SUBSPACES: SubspaceConfig[] = [
    {
        name: "MAX-SPORTS",
        subdomain: "sports",
        description: "P2P Probability & Telemetry Engine",
        route: "https://sports.max-institute.org"
    },
    {
        name: "MAX-GAMES",
        subdomain: "games",
        description: "Real-Time Edge Match & Durable Object Engine",
        route: "https://games.max-institute.org"
    }
];

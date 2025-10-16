import * as signalR from "@microsoft/signalr";

type HubKey = string;
type HubPath = string;

const connections = new Map<HubKey, signalR.HubConnection>();
const descriptors = new Map<HubKey, HubPath>();
const inFlight = new Map<HubKey, Promise<signalR.HubConnection>>();

function buildConnection(baseUrl: string, path: string) {
    const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/${path}`, {
            withCredentials: true,
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .build();

    conn.onclose((err) => console.log("[SignalR] closed", path, err));
    conn.onreconnecting((err) => console.log("[SignalR] reconnecting", path, err));
    conn.onreconnected((id) => console.log("[SignalR] reconnected", path, id));
    return conn;
}

export function registerHubs(hubs: { key: HubKey; path: HubPath }[]) {
    hubs.forEach(({key, path}) => descriptors.set(key, path));
}

function startConn(key: HubKey, conn: signalR.HubConnection) {
    const p = conn
        .start()
        .then(() => {
            console.log("[SignalR] started", descriptors.get(key));
            return conn;
        })
        .finally(() => {
            inFlight.delete(key);
        });

    inFlight.set(key, p);
    return p;
}

export async function ensureConnected(key: HubKey, baseUrl: string): Promise<signalR.HubConnection> {
    const path = descriptors.get(key);
    if (!path) throw new Error(`Unknown hub key: ${key}`);

    let conn = connections.get(key);
    if (!conn) {
        conn = buildConnection(baseUrl, path);
        connections.set(key, conn);
    }

    if (conn.state === signalR.HubConnectionState.Connected) return conn;

    const pending = inFlight.get(key);
    if (pending) return pending;

    if (conn.state === signalR.HubConnectionState.Disconnected) {
        return startConn(key, conn);
    }

    return pending ?? Promise.resolve(conn);
}

export function getConnection(key: HubKey) {
    return connections.get(key) ?? null;
}

export async function disconnectAll() {
    const pending = Array.from(inFlight.values());
    if (pending.length) {
        await Promise.allSettled(pending);
    }

    const list = Array.from(connections.values());
    await Promise.all(list.map((c) => c.stop().catch(() => {
    })));

    connections.clear();
    inFlight.clear();
}
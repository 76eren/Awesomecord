import {create} from "zustand";
import * as signalR from "@microsoft/signalr";

type HubKey = string;
type HubPath = string;
type HubConfig = { key: HubKey; path: HubPath };

type SignalRState = {
    baseUrl: string | null;

    // descriptors, connection state
    descriptors: Map<HubKey, HubPath>;
    connections: Map<HubKey, signalR.HubConnection>;
    inFlight: Map<HubKey, Promise<signalR.HubConnection>>;

    // actions
    setBaseUrl: (url: string | null) => void;
    registerHubs: (hubs: HubConfig[]) => void;
    ensure: (key: HubKey) => Promise<signalR.HubConnection>;
    getHub: (key: HubKey) => signalR.HubConnection | null;
    on: <T = unknown>(
        key: HubKey,
        event: string,
        handler: (payload: T) => void
    ) => () => void;
    connectAll: () => Promise<void>;
    disconnectAll: () => Promise<void>;
};

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

export const useSignalRStore = create<SignalRState>((set, get) => ({
    baseUrl: null,
    descriptors: new Map(),
    connections: new Map(),
    inFlight: new Map(),

    setBaseUrl: (url) => set({baseUrl: url}),

    registerHubs: (hubs) =>
        set((s) => {
            const next = new Map(s.descriptors);
            hubs.forEach(({key, path}) => next.set(key, path));
            return {descriptors: next};
        }),

    ensure: async (key) => {
        const {baseUrl, descriptors, connections, inFlight} = get();
        if (!baseUrl) throw new Error("SignalR baseUrl is not configured.");
        const path = descriptors.get(key);
        if (!path) throw new Error(`Unknown hub key: ${key}`);

        let conn = connections.get(key);
        if (!conn) {
            conn = buildConnection(baseUrl, path);
            connections.set(key, conn);
            set({connections: new Map(connections)});
        }

        if (conn.state === signalR.HubConnectionState.Connected) return conn;

        const pending = inFlight.get(key);
        if (pending) return pending;

        if (conn.state === signalR.HubConnectionState.Disconnected) {
            const p = conn
                .start()
                .then(() => {
                    console.log("[SignalR] started", descriptors.get(key));
                    return conn!;
                })
                .finally(() => {
                    const {inFlight: latest} = get();
                    latest.delete(key);
                    set({inFlight: new Map(latest)});
                });

            inFlight.set(key, p);
            set({inFlight: new Map(inFlight)});
            return p;
        }

        return Promise.resolve(conn);
    },

    getHub: (key) => {
        const {connections} = get();
        return connections.get(key) ?? null;
    },

    on: (key, event, handler) => {
        const {getHub} = get();
        const conn = getHub(key);
        if (!conn) {
            console.warn(`[SignalR] no connection for ${key} when subscribing ${event}`);
            return () => {
            };
        }
        conn.on(event, handler as (...args: any[]) => void);
        return () => conn.off(event, handler as (...args: any[]) => void);
    },

    connectAll: async () => {
        const {descriptors, ensure} = get();
        for (const key of descriptors.keys()) {
            try {
                await ensure(key);
            } catch (e) {
                console.error("[SignalR] connect failed", key, e);
            }
        }
    },

    disconnectAll: async () => {
        const {inFlight, connections} = get();

        const pending = Array.from(inFlight.values());
        if (pending.length) {
            await Promise.allSettled(pending);
        }

        const list = Array.from(connections.values());
        await Promise.all(
            list.map((c) =>
                c.stop().catch(() => {

                })
            )
        );

        set({
            connections: new Map(),
            inFlight: new Map(),
        });
    },
}));

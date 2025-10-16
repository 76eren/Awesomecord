import {createContext, useContext, useEffect, useMemo} from "react";
import type * as signalR from "@microsoft/signalr";
import {disconnectAll, ensureConnected, getConnection, registerHubs} from "./signalrManager";

type HubConfig = { key: string; path: string };

type SignalRCtx = {
    getHub: (key: string) => signalR.HubConnection | null;
    ensure: (key: string) => Promise<signalR.HubConnection>;
    on: <T = unknown>(key: string, event: string, handler: (payload: T) => void) => () => void;
};

const SignalRContext = createContext<SignalRCtx | null>(null);

type Props = {
    baseUrl: string;
    hubs: HubConfig[];
    autoConnect?: boolean;
    children: React.ReactNode;
};

export function SignalRProvider({baseUrl, hubs, autoConnect, children}: Props) {
    useEffect(() => {
        registerHubs(hubs);
    }, [hubs]);

    useEffect(() => {
        (async () => {
            if (autoConnect) {
                for (const h of hubs) {
                    try {
                        await ensureConnected(h.key, baseUrl);
                    } catch (e) {
                        console.error("[SignalR] connect failed", h.key, e);
                    }
                }
            } else {
                await disconnectAll();
            }
        })();
    }, [autoConnect, baseUrl, hubs]);

    useEffect(() => {
        return () => {
            void disconnectAll();
        };
    }, []);

    const api = useMemo<SignalRCtx>(
        () => ({
            getHub: (key) => getConnection(key),
            ensure: (key) => ensureConnected(key, baseUrl),
            on: (key, event, handler) => {
                const conn = getConnection(key);
                if (!conn) {
                    console.warn(`[SignalR] no connection for ${key} when subscribing ${event}`);
                    return () => {
                    };
                }
                conn.on(event, handler as (...args: any[]) => void);
                return () => conn.off(event, handler as (...args: any[]) => void);
            },
        }),
        [baseUrl]
    );

    return <SignalRContext.Provider value={api}>{children}</SignalRContext.Provider>;
}

export function useSignalR() {
    const ctx = useContext(SignalRContext);
    if (!ctx) throw new Error("useSignalR must be used within a SignalRProvider");
    return ctx;
}
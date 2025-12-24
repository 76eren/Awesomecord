import {useEffect} from "react";
import {useSignalRStore} from "../store/signalr-store.ts";

type HubConfig = { key: string; path: string };

type Props = {
    baseUrl: string;
    hubs: HubConfig[];
    autoConnect?: boolean;
};

export function SignalRRuntime({baseUrl, hubs, autoConnect}: Props) {
    const registerHubs = useSignalRStore((s) => s.registerHubs);
    const setBaseUrl = useSignalRStore((s) => s.setBaseUrl);
    const connectAll = useSignalRStore((s) => s.connectAll);
    const disconnectAll = useSignalRStore((s) => s.disconnectAll);

    useEffect(() => {
        setBaseUrl(baseUrl);
        registerHubs(hubs);
    }, [baseUrl, hubs, registerHubs, setBaseUrl]);

    useEffect(() => {
        let canceled = false;

        (async () => {
            if (autoConnect) {
                await connectAll();
            } else {
                await disconnectAll();
            }
            if (canceled) return;
        })();

        return () => {
            canceled = true;
        };
    }, [autoConnect, connectAll, disconnectAll]);

    useEffect(() => {
        return () => {
            void disconnectAll();
        };
    }, [disconnectAll]);

    return null;
}

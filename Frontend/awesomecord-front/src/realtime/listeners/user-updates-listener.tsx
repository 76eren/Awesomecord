import {useEffect} from "react";
import type {UserModel} from "../../models/user/user.model.ts";
import {useUserStore} from "../../store/user-store.ts";
import {useSignalRStore} from "../../store/signalr-store.ts";

export function UserUpdatesListener() {
    const setUser = useUserStore((s) => s.setUser);
    const ensure = useSignalRStore((s) => s.ensure);
    const on = useSignalRStore((s) => s.on);

    useEffect(() => {
        let canceled = false;
        let unsub: (() => void) | undefined;

        (async () => {
            try {
                await ensure("userupdates");
                if (canceled) return;

                const handler = (payload: {
                    updatedUserModel: UserModel;
                }) => {
                    setUser(payload.updatedUserModel);
                };

                unsub = on("userupdates", "UserUpdate", handler);
            } catch (e) {
                console.error("[SignalR] start failed", e);
            }
        })();

        return () => {
            canceled = true;
            if (unsub) unsub();
        };
    }, [ensure, on, setUser]);

    return null;
}
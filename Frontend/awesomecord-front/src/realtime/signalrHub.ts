import * as signalR from "@microsoft/signalr";

let hub: signalR.HubConnection | null = null;

export function getNotificationsHub(baseUrl: string, hubUrl: string) {
    if (!hub) {
        hub = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/${hubUrl}`, {
                withCredentials: true,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .build();

        hub.onclose(err => console.log("[SignalR] closed", err));
        hub.onreconnecting(err => console.log("[SignalR] reconnecting", err));
        hub.onreconnected(id => console.log("[SignalR] reconnected", id));
    }
    return hub;
}

export async function ensureHubStarted(baseUrl: string, hubUrl: string) {
    const h = getNotificationsHub(baseUrl, hubUrl);
    if (h.state === signalR.HubConnectionState.Disconnected) {
        await h.start();
        console.log("[SignalR] started");
    }
    return h;
}
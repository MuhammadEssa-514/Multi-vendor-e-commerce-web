import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = process.env.PUSHER_APP_ID
    ? new PusherServer({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        useTLS: true,
    })
    : null;

export const pusherClient = typeof window !== "undefined" && process.env.NEXT_PUBLIC_PUSHER_KEY
    ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
    : null;

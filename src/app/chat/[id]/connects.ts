"use server";
import { Client } from "@stomp/stompjs";

// Object.assign(global, { WebSocket });

class Connections {
	public values = {} as Record<string, boolean>;
}

const connects = new Connections();

Object.freeze(connects);

const client = new Client({
	brokerURL: "ws://localhost:15674/ws",
	onConnect: () => {
		client.subscribe("/topic/chat-2", (message) => {
			console.log("connection-status");
			const { userId, isConnected } = JSON.parse(message.body);
			connects.values[userId] = isConnected;
		});
	},
});

client.activate();

export const getConnects = async () => {
	return connects.values;
};

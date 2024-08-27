import { Client } from "@stomp/stompjs";
import Image from "next/image";
import { Chat } from "./chat";
import { getConnects } from "./connects";

// Object.assign(global, { WebSocket });

export default async function Home(a: { params: { id: string } }) {
	const connects = await getConnects();
	console.log(connects);
	return <Chat id={a.params.id} connects={connects} />;
}

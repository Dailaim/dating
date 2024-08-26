"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	ScrollArea,
	ScrollAreaCorner,
	ScrollAreaRoot,
	ScrollAreaViewport,
	ScrollBar,
} from "@/components/ui/scroll-area";
import { Filter, HeartIcon, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { createId } from "@paralleldrive/cuid2";
import { Client } from "@stomp/stompjs";
import { client } from "stompjs";

import { create } from "zustand";

import { immer } from "zustand/middleware/immer";

import { cn } from "@/lib/utils";

import { mountStoreDevtool } from "simple-zustand-devtools";

type message = {
	id: string | number;
	sender: string;
	content: string;
	timestamp: string;
};

type store = {
	chats: {
		[user: string]: {
			[message_id: string]: message;
		};
	};

	setChat: (
		mm: {
			id: string | number;
			sender: string;
			content: string;
			timestamp: string;
		},
		id?: string,
	) => void;
};

const useChat = create<store>()(
	immer((set) => ({
		chats: {},
		setChat: (mm, subID) => {
			set((state) => {
				const sender = subID ?? mm.sender;
				const id = mm.id;

				if (!state.chats[sender]) {
					state.chats[sender] = {};
				}

				if (state.chats[sender][id]) return;

				state.chats[sender][id] = mm;
			});
		},
	})),
);

mountStoreDevtool("Store", useChat);

// Placeholder data
const matches = [
	{
		id: "1",
		name: "Sarah",
		avatar: "/placeholder.svg?height=32&width=32",
		lastMessage: "Hey there!",
	},
	{
		id: "2",
		name: "Mike",
		avatar: "/placeholder.svg?height=32&width=32",
		lastMessage: "How's your day going?",
	},
	{
		id: "3",
		name: "Emily",
		avatar: "/placeholder.svg?height=32&width=32",
		lastMessage: "Nice to meet you!",
	},
	{
		id: "4",
		name: "Chris",
		avatar: "/placeholder.svg?height=32&width=32",
		lastMessage: "What are your hobbies?",
	},
];

const wait = (time: number) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(null);
		}, time);
	});
};

export function Chat({ id }: { id?: string }) {
	const defauld = matches.filter((val) => val.id !== id);
	const [activeMatch, setActiveMatch] = useState(defauld[0]);

	const { chats, setChat } = useChat();

	const [inputMessage, setInputMessage] = useState("");

	const [stompClient, setStompClient] = useState<Client | null>(null);

	const im = matches.find((val) => val.id === id);

	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const downScroll = async () => {
		await wait(200);
		const scrollArea = scrollAreaRef.current;
		if (scrollArea) {
			scrollArea.scrollTo(0, scrollArea.scrollHeight);
		}
	};

	useEffect(() => {
		downScroll();
	}, []); // Ejecutar al montar el componente o cuando el contenido cambie

	useEffect(() => {
		// Conectar con STOMP utilizando SockJS

		const client = new Client({
			brokerURL: "ws://8.tcp.ngrok.io:19372/ws", // Cambia por tu URL de WebSocket
			debug: (str) => console.log(str),
			connectHeaders: {
				login: "user",
				passcode: "password",
			},

			reconnectDelay: 5000,

			onStompError: (frame) => {
				console.error(`Broker error: ${frame.headers.message}`);
			},
		});

		client.onConnect = () => {
			client.subscribe(`/topic/chat-${id}`, (message) => {
				console.log(message);

				const newMessage = JSON.parse(message.body) as {
					id: string | number;
					sender: string;
					content: string;
					timestamp: string;
				};

				if (id !== newMessage.sender) {
					setChat(newMessage);
					downScroll();
				}
			});
		};

		client.activate();
		setStompClient(client);

		// Desconectar al desmontar
		return () => {
			if (stompClient) stompClient.deactivate();
		};
	}, []);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (inputMessage.trim() === "") return;

		const newMessage = {
			id: createId(),
			sender: id ?? "2",
			content: inputMessage,
			timestamp: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
		};

		// Enviar el mensaje a través de STOMP
		stompClient?.publish({
			destination: `/topic/chat-${activeMatch.id}`,
			body: JSON.stringify(newMessage),
		});

		setChat(newMessage, activeMatch.id);
		downScroll();
		setInputMessage("");
	};

	return (
		<div className="flex h-screen mx-auto border rounded-lg overflow-hidden">
			{/* Matches Sidebar */}
			<div className="w-1/3 bg-background border-r">
				<div className="p-4 border-b">
					<h2 className="text-xl font-bold">Matches</h2>
					<>{im?.name}</>
				</div>
				<ScrollArea className="h-[calc(600px-64px)]">
					{matches
						.filter((val) => val.id !== id)
						.map((match) => (
							<div
								key={match.id}
								className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted ${activeMatch.id === match.id ? "bg-muted" : ""}`}
								onClick={() => setActiveMatch(match)}
							>
								<Avatar>
									<AvatarImage src={match.avatar} alt={match.name} />
									<AvatarFallback>{match.name[0]}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="font-medium">{match.name}</p>
									<p className="text-sm text-muted-foreground truncate">
										{match.lastMessage}
									</p>
								</div>
							</div>
						))}
				</ScrollArea>
			</div>

			{/* Chat Area */}
			<div className="flex-1 flex flex-col">
				{/* Chat Header */}
				<div className="p-4 border-b flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Avatar>
							<AvatarImage src={activeMatch.avatar} alt={activeMatch.name} />
							<AvatarFallback>{activeMatch.name[0]}</AvatarFallback>
						</Avatar>
						<h2 className="text-xl font-bold">{activeMatch.name}</h2>
					</div>
					<Button size="icon" variant="ghost">
						<HeartIcon className="h-6 w-6 text-red-500" />
						<span className="sr-only">Like</span>
					</Button>
				</div>

				{/* Messages */}
				{/* <ScrollArea   className="flex-1 p-4">
				
				</ScrollArea> */}

				<ScrollAreaRoot className={cn("flex-1 p-4")}>
					<ScrollAreaViewport ref={scrollAreaRef}>
						{Object.values(chats[activeMatch.id] ?? {}).map((message) => (
							<div
								key={message.id}
								className={`flex flex-col mb-4 ${message.sender === id ? "items-end" : "items-start"}`}
							>
								<div
									className={`max-w-[70%] p-3 rounded-lg ${
										message.sender === id
											? "bg-primary text-primary-foreground"
											: "bg-muted"
									}`}
								>
									<p>{message.content}</p>
								</div>
								<span className="text-xs text-muted-foreground mt-1">
									{message.timestamp}
								</span>
							</div>
						))}
					</ScrollAreaViewport>
					<ScrollBar />
					<ScrollAreaCorner />
				</ScrollAreaRoot>

				{/* Message Input */}
				<form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
					<Input
						placeholder="Type a message..."
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						className="flex-1"
					/>
					<Button type="submit" size="icon">
						<SendIcon className="h-4 w-4" />
						<span className="sr-only">Send message</span>
					</Button>
				</form>
			</div>
		</div>
	);
}

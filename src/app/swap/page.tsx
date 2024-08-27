"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	animated,
	to as interpolate,
	useSpring,
	useSprings,
} from "@react-spring/web";
import { DoorClosedIcon, Heart, HeartIcon, X } from "lucide-react";
import { type DragEventHandler, useEffect, useState } from "react";

import { useDrag } from "@use-gesture/react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type user = {
	id: number;
	name: string;
	age: number;
	bio: string;
	image: string;
};

type Store = {
	stack: {
		[user_id: string]: user;
	};

	dep: user[];

	addStack: (...users: user[]) => void;

	del: (id: string) => void;
};

const useStack = create<Store>()(
	immer((set) => ({
		stack: {
			1: {
				id: 1,
				name: "Sarah",
				age: 28,
				bio: "Adventure seeker and coffee lover",
				image:
					"https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c2d2d351-71d7-4fcd-9af6-f28876f6759b/width=450/tmp6izukxgu.jpeg",
			},
			2: {
				id: 2,
				name: "John",
				age: 32,
				bio: "Foodie and travel enthusiast",
				image:
					"https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/b140b16c-5b55-4d19-b2ae-bff7873eeda9/width=450/Classic3.1_2.jpeg",
			},
			3: {
				id: 3,
				name: "Emily",
				age: 26,
				bio: "Bookworm and cat person",
				image:
					"https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/04a35995-2102-4cfe-9894-303dc3c240c2/width=450/00016-1374751486.jpeg",
			},
			4: {
				id: 4,
				name: "Michael",
				age: 30,
				bio: "Fitness freak and beach lover",
				image:
					"https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/87f87bda-60bd-48df-8186-022036765bfc/width=450/00003-3575073426.jpeg",
			},
		},

		dep: [],

		addStack(...users) {},
		del(id) {},
	})),
);

const to = (i: number) => ({
	x: 0,
	y: i * -4,
	scale: 1,
	// rot: -10 + Math.random() * 20,x
	delay: i * 100,
});
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
	`perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

// Placeholder data for user profiles
const users = [
	{
		id: 1,
		name: "Sarah",
		age: 28,
		bio: "Adventure seeker and coffee lover",
		image:
			"https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c2d2d351-71d7-4fcd-9af6-f28876f6759b/width=450/tmp6izukxgu.jpeg",
	},
	{
		id: 2,
		name: "John",
		age: 32,
		bio: "Foodie and travel enthusiast",
		image:
			"https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/b140b16c-5b55-4d19-b2ae-bff7873eeda9/width=450/Classic3.1_2.jpeg",
	},
	{
		id: 3,
		name: "Emily",
		age: 26,
		bio: "Bookworm and cat person",
		image:
			"https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/04a35995-2102-4cfe-9894-303dc3c240c2/width=450/00016-1374751486.jpeg",
	},
	{
		id: 4,
		name: "Michael",
		age: 30,
		bio: "Fitness freak and beach lover",
		image:
			"https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/87f87bda-60bd-48df-8186-022036765bfc/width=450/00003-3575073426.jpeg",
	},
];

export default function Component() {
	const [gone] = useState(() => new Set()); // The set flags all the cards that are flicked out

	const { addStack, stack, del } = useStack();

	const [props, api] = useSprings(Object.keys(stack).length, (i) => ({
		...to(i),
		from: from(i),
	}));

	const bind = useDrag(
		({
			args: [index],
			active,
			movement: [mx],
			direction: [xDir],
			velocity,
		}) => {
			const trigger = velocity[0] > 0.2; // If you flick hard enough it should trigger the card to fly out
			if (!active && trigger) gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
			api.start((i) => {
				if (index !== i) return; // We're only interested in changing spring-data for the current spring
				const isGone = gone.has(index);
				const x = isGone ? (200 + window.innerWidth) * xDir : active ? mx : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
				const rot = mx / 100 + (isGone ? xDir * 10 * velocity[0] : 0); // How much the card tilts, flicking it harder makes it rotate faster
				const scale = active ? 1.1 : 1; // Active cards lift up a bit
				return {
					x,
					// rot,
					scale,
					delay: undefined,
					config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
				};
			});
			if (!active && gone.size === users.length)
				setTimeout(() => {
					gone.clear();
					api.start((i) => to(i));
				}, 600);
		},
	);

	useEffect(() => {
		api.start((i) => to(i));
	}, []);

	return (
		<div className="flex flex-col min-h-screen bg-background">
			<header className="flex items-center justify-center h-16 border-b">
				<h1 className="text-2xl font-bold text-primary">TinderClone</h1>
			</header>
			<main className="relative w-full max-w-md h-[90vh]">
				<div className="">
					{props.map(({ x, y, rot, scale }, i) => (
						<animated.div
							key={`${i + 2}-person`}
							style={{ x, y }}
							className={"absolute select-none h-full"}
						>
							<animated.div
								{...bind(i)}
								style={{
									touchAction: "pan-y",
									transform: interpolate([rot, scale], trans),
								}}
								className={
									"bg-white rounded-2xl shadow-lg overflow-hidden h-full"
								}
							>
								<div className="relative h-full">
									<img
										src={users[i].image}
										alt={users[i].name}
										className="object-cover w-full h-full"
									/>
									<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
										<h3 className="text-2xl font-bold">
											{users[i].name}, {users[i].age}
										</h3>
										<p className="text-sm">{users[i].bio}</p>
									</div>
								</div>
							</animated.div>
						</animated.div>
					))}
					{/* </AnimatePresence> */}
					<div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							className="bg-white/70 hover:bg-white rounded-full p-4 shadow-lg"
							// onClick={() => handleSwipe("left")}
						>
							<DoorClosedIcon className="w-6 h-6 text-red-500" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="bg-white/70 hover:bg-white rounded-full p-4 shadow-lg"
							// onClick={() => handleSwipe("right")}
						>
							<HeartIcon className="w-6 h-6 text-green-500" />
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
}

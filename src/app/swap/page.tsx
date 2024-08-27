"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	animated,
	to as interpolate,
	useSpring,
	useSprings,
} from "@react-spring/web";
import { Heart, X } from "lucide-react";
import { type DragEventHandler, useState } from "react";

import { useDrag } from "@use-gesture/react";

const to = (i: number) => ({
	x: 0,
	y: i * -4,
	scale: 1,
	rot: -10 + Math.random() * 20,
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

	const [props, api] = useSprings(users.length, (i) => ({
		...to(i),
		from: from(i),
	}));

	const bind = useDrag(
		({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
			console.log("velocity", velocity);
			const trigger = velocity[0] > 0.2; // If you flick hard enough it should trigger the card to fly out
			const dir = xDir < 0 ? -1 : 1; // Direction should either point left or right
			if (!down && trigger) gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
			api.start((i) => {
				if (index !== i) return; // We're only interested in changing spring-data for the current spring
				const isGone = gone.has(index);
				const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
				const rot = mx / 100 + (isGone ? dir * 10 * velocity[0] : 0); // How much the card tilts, flicking it harder makes it rotate faster
				const scale = down ? 1.1 : 1; // Active cards lift up a bit
				return {
					x,
					rot,
					scale: scale,
					delay: undefined,
					config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
				};
			});
			if (!down && gone.size === users.length)
				setTimeout(() => {
					gone.clear();
					api.start((i) => to(i));
				}, 600);
		},
	);

	return (
		<div className="flex flex-col min-h-screen bg-background">
			<header className="flex items-center justify-center h-16 border-b">
				<h1 className="text-2xl font-bold text-primary">TinderClone</h1>
			</header>
			<main className="flex-grow flex items-center justify-center p-4">
				<div className="w-full max-w-md relative">
					{props.map(({ x, y, rot, scale }, i) => (
						<animated.div
							key={`${i + 2}-person`}
							style={{ x, y }}
							className={"absolute select-none"}
						>
							<animated.div
								{...bind(i)}
								style={{
									transform: interpolate([rot, scale], trans),
								}}
							>
								<Card className="w-full">
									<CardContent className="p-0">
										<img
											onDragStart={(e) => {
												e.preventDefault();
											}}
											src={users[i].image}
											alt={users[i].name}
											className="w-full h-[400px] object-cover"
										/>
										<div className="p-4">
											<h2 className="text-2xl font-bold">
												{users[i].name}, {users[i].age}
											</h2>
											<p className="text-muted-foreground">{users[i].bio}</p>
										</div>
									</CardContent>
								</Card>
							</animated.div>
						</animated.div>
					))}
					{/* </AnimatePresence> */}
					<div className="flex justify-center mt-4 space-x-4">
						<Button
							variant="outline"
							size="icon"
							className="w-16 h-16 rounded-full"
							onClick={() => handleSwipe("left")}
						>
							<X className="h-8 w-8 text-destructive" />
							<span className="sr-only">Dislike</span>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="w-16 h-16 rounded-full"
							onClick={() => handleSwipe("right")}
						>
							<Heart className="h-8 w-8 text-green-500" />
							<span className="sr-only">Like</span>
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
}

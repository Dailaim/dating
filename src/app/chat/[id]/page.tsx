import Image from "next/image";
import { Chat } from "./chat";

export default function Home(a:{ params: { id: string }}) {
  console.log(a)
  return <Chat id={a.params.id} />
}

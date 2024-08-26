"yse client"

import { StompSessionProvider } from "react-stomp-hooks";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   
        <StompSessionProvider
        brokerURL=""
      url={"https://stream.elite12.de/api/sock"}
      //All options supported by @stomp/stompjs can be used here
    >

      {children}
    </StompSessionProvider>

  );
}

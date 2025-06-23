"use client";

import {QueryClient , QueryClientProvider} from "@tanstack/react-query";
import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import config from "@/rainbowKitConfig";
import { RainbowKitProvider , ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";



export function Providers(props: {children: ReactNode}) {

 // Create a single QueryClient instance for React Query
 const [queryClient] = useState(() => new QueryClient()); 
    return (
        <WagmiProvider config = {config}> 
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>    
                {props.children}
            </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}   

// 02 - This file sets up the providers needed for the application, including
//  Wagmi for Ethereum interactions and TanStack Query for data fetching.
"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { anvil,zksync,mainnet,baseSepolia,base,optimism } from   "wagmi/chains";


export default getDefaultConfig ({

   appName: "TSender",
   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!, 
  chains: [anvil, zksync, mainnet, baseSepolia, base, optimism],
  ssr : false,

}) 

// 01 - This file is used to configure RainbowKit, a library for building wallet connection UIs in React applications.
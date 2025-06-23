"use client"

import InputField from "./ui/InputField";
import  { useState, useMemo, useEffect } from "react";
import { chainsToTSender,tsenderAbi,erc20Abi } from "@/constants";
import { useChainId , useConfig , useAccount, useWriteContract} from "wagmi";
import {readContract , waitForTransactionReceipt} from "@wagmi/core";
import { calculateTotal } from "@/utils"


export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipents, setRecipents] = useState("");
    const [amounts, setAmounts] = useState("");
    const [loading , setLoading] = useState(false);
    // State for token details ---
    const [tokenDetails, setTokenDetails] = useState<{ name?: string; symbol?: string; decimals?: number }>({});

    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();

    const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
    const {data:hash ,isPending, writeContractAsync} = useWriteContract()

  // --- Local Storage: Load on mount ---
  // To maintain data localy to server after refresh 
  useEffect(() => {
    setTokenAddress(localStorage.getItem("tokenAddress") || "");
    setRecipents(localStorage.getItem("recipents") || "");
    setAmounts(localStorage.getItem("amounts") || "");
  }, []);


  // --- Local Storage: Save on change ---
  useEffect(() => {
    localStorage.setItem("tokenAddress", tokenAddress);
  }, [tokenAddress]);
  useEffect(() => {
    localStorage.setItem("recipents", recipents);
  }, [recipents]);
  useEffect(() => {
    localStorage.setItem("amounts", amounts);
  }, [amounts]);

      // Fetch token details when tokenAddress changes ---
    useEffect(() => {
        async function fetchTokenDetails() {
            if (!tokenAddress || tokenAddress.length !== 42) {
                setTokenDetails({});
                return;
            }
            try {
                const name = await readContract(config, {
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: "name",
                }) as string;
                const symbol = await readContract(config, {
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: "symbol",
                }) as string;
                const decimals = await readContract(config, {
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: "decimals",
                }) as number;
                setTokenDetails({ name, symbol, decimals });
            } catch {
                setTokenDetails({});
            }
        }
        fetchTokenDetails();
    }, [tokenAddress, config]); 

async function getApprovedAmount(tSenderAddress: string | null ) :Promise<number> {
  
    if (!tSenderAddress) {
        alert("no add found. use correct chain");
        return 0;
    }
    // read from the chain to see if we have approved enough tokens
    const response = await readContract(config ,{
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "allowance",
        args: [account.address, tSenderAddress as `0x${string}`],

     
    });
   
    // token.allowance (account,tsender)
   return response as number;


}

    async function handleSubmit() { 
      
        //1a - if approved move to step 2;
        // 1b- approve our tsender contract to spend the tokens
        //2 -call the airdrop function in the tsender contract
        //3-wait for transaction to be mined
        //** - if successfull, show a success message

         setLoading(true);
        const tSenderAddress = chainsToTSender[chainId]["tsender"]; // Mainnet TSender address
        const approvedAmount = await getApprovedAmount(tSenderAddress);

      if(approvedAmount <total){
          const approvalHash = await writeContractAsync({
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "approve",
            args: [tSenderAddress as `0x${string}`, BigInt(total)],
            });
        
    
        const approvalRecipt = await waitForTransactionReceipt(config,{
             hash: approvalHash
             });
      
             console.log("Approval confirmed:", approvalRecipt)

             // if not approved first approve and the  call the transaction 
             await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipents.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
                console.log("Airdrop transaction sent:", hash);
                setLoading(false);
                return;

        }  else {
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipents.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            },)
            console.log("Transaction sent");
            setLoading(false);
        }
       setLoading(false);

  }
        // if result is < total amount needed
        
    console.log("tokenaddress", tokenAddress);
    console.log("recipents", recipents);
    console.log("amounts", amounts);

return ( 
          
    <div>
        <InputField
         label="Token Address"
          placeholder="0x..."
          value={tokenAddress} 
           onChange={(e) => setTokenAddress(e.target.value)} 
        />
          <InputField
         label="Recipent Address"
          placeholder="0x1234, 0x12345, ...."
          value={recipents} 
           onChange={(e) => setRecipents(e.target.value)}
           large ={true} 
        />
         <InputField
         label="Amounts"
          placeholder="100,200,200 ..."
          value={amounts} 
           onChange={(e) => setAmounts(e.target.value)}
           large ={true} 
        />
           <button
           onClick={handleSubmit}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:scale-105 hover:from-indigo-600 hover:to-purple-700 transition-transform duration-200"
           >
            {/* The button text changes based on the loading state: */}
         {loading ? "Processing..." : "Send Tokens"}
          </button>

          {/* This block only renders if loading is true. */}
          {loading && (
                <div className="mt-2 flex items-center gap-2">
                    <span className="loader"></span>
                    <span>Waiting for wallet confirmation or transaction...</span>
                </div>
            )}
             {/* --- NEW: Token Details Box --- */}
            <div className="mt-6 p-4 rounded-lg bg-red-700-100 border border-gray-300"> {/* <-- update */}
                <h3 className="font-semibold mb-2">Token Details</h3>
                {tokenDetails.name ? (
                    <ul>
                        <li><strong>Name:</strong> {tokenDetails.name}</li>
                        <li><strong>Symbol:</strong> {tokenDetails.symbol}</li>
                        <li><strong>Decimals:</strong> {tokenDetails.decimals}</li>
                    </ul>
                ) : (
                    <span className="text-gray-500">Enter a valid token address to see details.</span>
                )}
            </div>
            {/* --- END Token Details Box --- */}

    </div>

)
}

// 06 - This file defines the AirdropForm component, 
// which allows users to input token details and initiate an airdrop transaction.
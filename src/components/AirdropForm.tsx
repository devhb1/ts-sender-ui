"use client"

import InputField from "./ui/InputField";
import  { useState, useMemo } from "react";
import { chainsToTSender,tsenderAbi,erc20Abi } from "@/constants";
import { useChainId , useConfig , useAccount, useWriteContract} from "wagmi";
import {readContract , waitForTransactionReceipt} from "@wagmi/core";
import { calculateTotal } from "@/utils"
import { set } from "zod/v4";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipents, setRecipents] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
    const {data:hash ,isPending, writeContractAsync} = useWriteContract()

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
         //3-wait for transaction to be mined .
        //** - if successfull, show a success message

        
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
        }
    

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
         Send Tokens
          </button>


    </div>

)
}
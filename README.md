TASK: 
create a basic react app ✅
connect wallet with a nicer app ✅
implement this fnc
```javascript 
const airdropERC20( 
    address tokenAddress , //ERC20 token
    address [] calldata recipents,
    uint256 totalAmount ,
)

```
deploy to fleek


Challenges:

     1.Add quality of life features to the app:

        i. Should have a little spinner while the app is both sending a   transaction to the chain, and has MetaMask popped up  ✅ 

        - > (solved using usestate hook and whenever the process is in handlesubmit while clicking button a generic css is also loaded
        

```html
{loading ? "Processing..." : "Send Tokens"}
          </button>
          {loading && (
                <div className="mt-2 flex items-center gap-2">
                    <span className="loader"></span>
                    <span>Waiting for wallet confirmation or transaction...</span>
                </div>
            )}
```
        )

       ii. Should save to local storage the inputs (so when someone refreshes, they don't lose their inputs). ✅
       ---> ( solved using useEffect hook .  load from local storage upon mount. using
 ```javascript 
       useEffect(() => {
  setTokenAddress(localStorage.getItem("tokenAddress") || "");
  setRecipents(localStorage.getItem("recipents") || "");
  setAmounts(localStorage.getItem("amounts") || "");
}, []); 
// and setitem and save to local storage if any change
useEffect(() => {
  localStorage.setItem("tokenAddress", tokenAddress);
}, [tokenAddress]);

```
        ) 


       iii.  Should have a little box at the bottom for details about the token ✅

       ---> solved using readContract and usestate, useEffect hook
```javascript 
const [tokenDetails, setTokenDetails] = useState<{ name?: string; symbol?: string; decimals?: number }>({});
```
and 

```javascript
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

```


4. e2e testing:
  when we connect we see the form
  and when we not connect we do not 

    2. Deploy your site to fleek

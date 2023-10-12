import * as ethers from "ethers";

const chainId ="0x0038";
const loggerAddress = "0x37CfAC15ede74F29Fe164C460974BD61cC799eff";
const wss = "wss://eth-mainnet.alchemyapi.io/v2/private_key";

function cutActionId(str: string) {
    let arr: Array<string> = [];
    if (str.search(chainId)) {
        str = str.slice(6);
    }
    for (let i = 3; i < str.length; i += 4) {
        let actionId = str[i - 3] + str[i - 2] + str[i - 1] + str[i];
        arr.push(actionId);
    }

    const numActionId = arr.length;

    let arrAction: Array<string> = [];

    for (let i = 1; i < (1 << numActionId); i++) {
        let s = chainId.toString();
        for (let j = 0; j < numActionId; j++) {
            if ((i >> j) & 1) {
                s = s + str[j];
            }
        }
        arrAction.push(s);
    }

    return { arrAction: arrAction, action: chainId + str };
}

async function updateRecipeUse() {
    const provider = new ethers.WebSocketProvider(wss);
    // const provider = new ethers.JsonRpcProvider("https://bsc.publicnode.com");
    // console.log((await provider.getNetwork()).chainId)
    const loggerABI = ["event RecipeEvent(address indexed caller, string indexed logName)"];
    const loggerContract = new ethers.Contract(
        loggerAddress,
        loggerABI,
        provider
    );
    console.log(loggerContract.filters)
  
    const filter = {
        event: "RecipeEvent",
        fromBlock: 31952098, // Start block number
        toBlock: 31952070,   // End at the latest block
    };

    // Use the filter to get events(address,string)
    console.log(1111);
    let x = await loggerContract.queryFilter("RecipeEvent", 32162829, 32163115)
    console.log(x)
}

updateRecipeUse();
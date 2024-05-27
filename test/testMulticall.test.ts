import { Contract, JsonRpcProvider } from "ethers";
import ABITravaLP from "../src/abis/TravaLendingPool.json";
import BEP20ABI from "../src/abis/BEP20.json";
import { multiCall } from "../src/utils/helper";
import { getAddr } from "../src/utils";

const test = async () => {
    const provider = new JsonRpcProvider("https://bsc-rpc.publicnode.com")
    const market = getAddr("TRAVA_LENDING_POOL_MARKET", 56);
    const TravaLendingPool = new Contract(
        market!,
        ABITravaLP,
        provider
    );
    const reserveAddressList = await TravaLendingPool.getReservesList(); //danh sách địa chỉ tài sản dự trữ trong LP
    console.log("listToken", reserveAddressList)
    console.log("userTokenInPoolBalance", reserveAddressList.map((address: string, _: number) => ({
        address: address,
        name: "balanceOf",
        params: ["0x9e47969Dc2e13b46575AD9663646a0214a13F880"],
    })),)
    let [userTokenInPoolBalance, smartWalletTokenInPoolBalance,] = await Promise.all([
        // gọi cùng 1 phương thức 'balanceOf' trên tất cả địa chỉ tài sản dự trữ
        multiCall( //lấy số dư của người dùng
            BEP20ABI,
            reserveAddressList.map((address: string, _: number) => ({
                address: address,
                name: "balanceOf",
                params: ["0x9e47969Dc2e13b46575AD9663646a0214a13F880"],
            })),
            provider,
            56
        ),
        multiCall(//lấy số dư smart wallet
            BEP20ABI,
            reserveAddressList.map((address: string, _: number) => ({
                address: address,
                name: "balanceOf",
                params: ["0x8E79c4f9c4D71aecd0B00a755Bcfe0b86A5d181E"],
            })),
            provider,
            56
        )
    ]);

    console.log(userTokenInPoolBalance, smartWalletTokenInPoolBalance)

};
test();

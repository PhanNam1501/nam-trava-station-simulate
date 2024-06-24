import * as sdk from "trava-station-sdk";

const test = async () => {
    const walletAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
    const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE"
    const pullAction = new sdk.actions.basic.PullTokenAction(
        "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6",
        walletAddress,
        "100000000"
    )

    const sendAction = new sdk.actions.basic.SendTokenAction(
        "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6",
        walletAddress,
        "1000000"
    )

    const recipe = new sdk.Recipe(
        "1234",
        [
            pullAction,
            sendAction
        ]
    )

    console.log(recipe.encodeForDsProxyCall())

}
test();

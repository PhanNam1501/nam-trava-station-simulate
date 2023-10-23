import { ApplicationState } from "../../../../../State/ApplicationState";

export async function updateAuctionNFTFromContract(
    appState1: ApplicationState,
): Promise<ApplicationState> {
    const appState = { ...appState1 };
    try {

    } catch (e) {
        console.log(e);
    }
    return appState;
}
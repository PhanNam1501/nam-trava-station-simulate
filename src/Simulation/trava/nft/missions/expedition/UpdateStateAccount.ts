import { ApplicationState, Vault, VaultState } from "../../../../../State";
import { getAddr } from "../../../../../utils";
import { multiCall } from "../../../../../utils/helper";
import { vaultOptions } from "./expeditionConfig";



export async function updateExpeditionState(appState1: ApplicationState, force = false) {
    let appState = { ...appState1 };
    try {
      /*
      Cập nhật: 
      - From: smart wallet
      - EXPENDITIONS: 
      + id
      + Raritys: diamond 430, gold 70, silver 0, bronze 0
      + professional: 3 hour
      + success reward: 300 TRAVA
      + Total knights deployed: 502 Knights
      + Owned Knights: 420 Knights
      - Các NFT đang sở hữu: 
        + ID NFT
        + Rarity: diamond
        + EXP: 702.731
        + Remainning time: 1 day 15 hours
        + success rate: 0.68%
        + porential expentience: 54,000
      - BOOST:
        + YOUR TICKET: 0
      */
      
      const listvault = vaultOptions[appState.chainId];

      
      
    } catch (err) {
        console.log(err)
      }
      return appState;
    }


    export async function updateVaultState(appState1: ApplicationState, force = false) {
      let appState = { ...appState1 };
      try {
        /*
        Cập nhật: 
        - From: smart wallet
        - EXPENDITIONS: 
        + id
        + Raritys: diamond 430, gold 70, silver 0, bronze 0
        + professional: 3 hour
        + success reward: 300 TRAVA
        + Total knights deployed: 502 Knights
        + Owned Knights: 420 Knights
        */
        // check force

        const listvault = vaultOptions[appState.chainId];
        for (let i = 0; i < listvault.length; i++) {
          let key = listvault[i].id
          let vault: Vault = {
            ...listvault[i],
            totalKnight: 0, // getExpeditionCount
            //  @notice  .
            //  @dev     getExpeditionCount Get count of all knight of that rarity which has been deployed
            //  @param   _rarity  Rarity
            //  @return  uint256  
            // function getExpeditionCount(uint256 _rarity) public view returns (uint256) {
            //   return expeditionCount[_rarity];
            // }
            ownedKnight: 0, // getTokenOfOwnerBalance
            //   * @notice  .
            //   * @dev     getTokenOfOwnerBalance Get currently deployed knight count of an address
            //   * @param   _owner  Owner address
            //   * @return  uint256  .
            //   function getTokenOfOwnerBalance(address _owner)
            //   external
            //   view
            //   returns (uint256)
            // {
            //   return EnumerableSet.length(_tokenOfOwner[_owner]);
            // }
            raritys: new Map(), // 
            profession: "", // 
            successReward: 0, //
            failureRefund: 0, // 
            token: {
              address: getAddr("TRAVA_TOKEN_ADDRESS", appState.chainId).toLowerCase(), //
              decimals: 18, //
            }
          }
          appState.VaultState.vaults.set(key, vault)
        }
        multiCall
        getAddr

        
        
      } catch (err) {
          console.log(err)
        }
        return appState;
      }
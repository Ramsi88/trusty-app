import { Contract } from "ethers";
import {
  FACTORY_ADDRESS,
  FACTORY_ABI
} from "../constants";

export default async function Trusty(props) {

  //const _provider = props;
  //const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, _provider);
  //let total = await contract.totalTrusty();

  return(<div>
    <h1>TRUSTY</h1>
    {props}
    {/* {JSON.stringify(_provider.toString())} */}
    {/* {JSON.stringify(total.toString())} */}
  </div>)
}

/**
 * getEtherBalance: Retrieves the ether balance of the user or the contract
 */



export const actions = [
    {type: "ERC20", calldata: "approve(address,uint256)", description: "Approves and authorize sending to an ADDRESS an AMOUNT"},
    {type: "ERC20", calldata: "transfer(address,uint256)", description: "Transfer to an ADDRESS an AMOUNT"},
    {type: "Factory", calldata: "trustyConfirm(uint256,uint256)", description: "Use this to confirm a transaction from Factory when you have more than a Trusty linked"},
    {type: "Factory", calldata: "trustyExecute(uint256,uint256)", description: "Use this to execute a transaction from Factory when you have more than a Trusty linked"},
    {type: "Trusty", calldata: "confirmTransaction(uint256)", description: "Use this to confirm a transaction when you have more than a Trusty linked"},
    {type: "Trusty", calldata: "confirmTransaction(uint256)", description: "Use this to execute a transaction when you have more than a Trusty linked"},
    //{type: "Recovery", calldata: "recover()", description: "Use this to execute an ETH Recover of a Trusty in Recovery mode"},
    //{type: "Recovery", calldata: "recoverERC20(address)", description: "Use this to execute an ERC20 Recover of a Trusty in Recovery mode"},
    //{type: "Recovery", calldata: "unlock()", description: "Use this to execute an unlock updating the Absolute Timelock of a Trusty in Recovery mode"}
]
// UTILS

import { ethers } from "ethers";

export function encodeMethod(txData) {
    let data = txData;
    let obj = {
        method: "",
        types: "",
        args: "",
        hex: "",
        hexn: 0,
        ptr: 0,
        argLoc: "",
        arg: [""]
    };

    let bytes = [];
    let types = "";
    let args = [];


    let isParam = false;
    let isArr = false;
    let _arg = 0;

    for (let i = 0; i < data.length; i++) {
        if (!isParam) {
            types += data[i];
        } else {
            if (data[i] === "," && isParam === true && isArr === false) {
                _arg++;
                obj.arg[_arg] = "";
            }
            else if (data[i] === "[" && isParam === true && !isArr) {
                //console.log("startArr",data[i]);isArr=true;
            }
            else if (data[i] === "]" && isParam === true && isArr) {
                //console.log("endArr",data[i]);isArr=false;
            }
            else {
                args += data[i];
                obj.arg[_arg] += data[i];
            }
        }
        if (data[i] === ")") {
            isParam = true;
        }
    }

    bytes.push(types);
    bytes.push(args);

    obj.types = types;
    obj.args = args;
    obj.method = ethers.keccak256(Buffer.from(types)).slice(0, 10);
    obj.hex = `${obj.method}`;

    for (let i = 0; i < obj.arg.length; i++) {
        // 1 >>>>> array
        if (obj.arg[i].includes(",")) {
            let tmp = [""];
            let iter = 0;
            for (let x = 0; x < obj.arg[i].length; x++) {
                if (obj.arg[i][x] === ",") {
                    iter++;
                    tmp[iter] = "";
                } else {
                    tmp[iter] += obj.arg[i][x];
                }
            }

            //Data-Length
            obj.hexn++;
            obj.hex += `${thirdTopic(tmp.length.toString(16), true)}`;

            for (let y = 0; y < tmp.length; y++) {
                //Data-Value
                obj.hexn++;
                obj.hex += `${thirdTopic(tmp[y], true)}`;
            }
            continue;
        }
        // 2 >>>>> array
        if (isNaN(obj.arg[i]) && obj.arg[i] !== "true" && obj.arg[i] !== "false") {
            //Data-Loc
            obj.hexn++;
            continue;
        }
        // 3 >>>>> number array
        if (obj.arg[i].length > 0) {
            obj.hexn++;
            obj.hex += `${thirdTopic(obj.arg[i])}`;
        }
    }
    return obj;
}

export function encodeCalldata(tokens, network, txTo, setTxData, selector, paramtype1, paramtype2) {
    try {
        const decimals = tokens[network.name.toLowerCase()]?.find((el) => { if (el.address == txTo) { return el.decimals } })?.decimals || 0

        let newAmount;

        if (paramtype2.includes(".")) {
            let unit = paramtype2.split(".")

            if (unit[1].length > decimals) {
                console.log(`Too many decimals ${decimals - unit[1].length}`)
                return
            } else {
                unit[0] = unit[0]
                unit[1] = unit[1]
            }

            if (unit[0] === "0") {
                if (unit[1].length < decimals) {
                    newAmount = parseInt(unit[1]).toString() + "0".repeat(decimals - (unit[1].length))
                } else {
                    newAmount = parseInt(unit[1]).toString()
                }
            } else {
                newAmount = unit[0] + unit[1] + "0".repeat(decimals - unit[1].length)
            }
        } else {
            newAmount = paramtype2.toString() + "0".repeat(decimals);
        }
        setTxData(selector + paramtype1 + "," + newAmount)
    } catch (err) {
        console.log(`[ERROR] unable to encode: ${err}`)
    }
}

export function thirdTopic(arg) {
    if (arg) {
        // add the address and left-pad it with zeroes to 32 bytes then return the value
        // 
        //createContract(address[],uint256)[0x,0x,0x],2
        //confirmTransaction(uint,bool,address,bytes)2,true,0xaBc4406d3Bb25C4D39225D516f9C3bbb8AA2CAD6,una stringa casuale
        //const address = "28c6c06298d514db089934071355e5743bf21d60";
        let paramArr = 0;
        // is BOOLEAN
        if (arg === "true") {
            arg = "1";
        } else if (arg === "false") {
            arg = "0";
        }
        // is type ADDRESS left-padded
        else if (arg.startsWith("0x") && arg.length === 42) {
            arg = arg.slice(2);
            const topic = arg;
            return "0".repeat(64 - arg.length) + topic;
        }
        // is type BYTES calldata
        else if (arg.startsWith("0x") && arg.length > 42) {
            //console.log(">>>")
            arg = arg.slice(2)
            return arg
        }
        // is NUMBER
        else if (!isNaN(arg)) {
            arg = parseInt(arg).toString(16);
        }
        // is BYTES string right-padded
        else if (isNaN(arg)) {
            arg = convertToHex(arg);
            const topic = arg;
            return topic + "0".repeat(64 - arg.length);
        }
        // is BYTES
        else {
            arg = arg;
        }
        const topic = arg;
        return "0".repeat(64 - arg.length) + topic;
    }
}

export function hex2string(hexx) {
    if (hexx) {
        var hex = hexx.toString();//force conversion
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    } else { return null }
}

export async function notifica(msg, setNotification, clear) {
    setNotification(msg.toString());
    setTimeout(() => { clear(setNotification) }, 15000);
}

export function clear(setNotification) {
    setNotification(null);
}

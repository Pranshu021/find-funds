import { ethers } from 'ethers';
import { useState } from 'react';

const useFetchAddress = () => {

    const [address, setAddress] = useState(null)

    if(window.ethereum) {
        (async() => {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();
            console.log(userAddress);
            setAddress(userAddress);
        })();
        
    } else {
        return 'Metamask not Found'
    }

    return address;
    
}

export default useFetchAddress;
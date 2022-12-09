import { createSlice } from "@reduxjs/toolkit";
const ethereum = window.ethereum

let address = ''
const getAddress = async() => {
    await ethereum.request({method: 'eth_requestAccounts'}).then((accounts)=>{
        address = accounts[0];
    }).catch((error) => {
        if(error.code === 4001) {
            console.log("Please connect to Metamask")
        } else {
            console.error(error)
        }
    })
}


const addressSlice = createSlice({
    name: 'address',
    initialState: address,
    reducers: {
        changeAddress(state, action) {
            getAddress();
            state = action.payload;
        }
    }
})

export const changeAddress = addressSlice.actions;
export default addressSlice.reducer;
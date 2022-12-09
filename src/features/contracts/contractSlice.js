import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    projectContractAddress: '',
    projectContract: {},
    fundsContractAddress: '',
    fundsContract: {}
}

export const contractSlice = createSlice({
    name: 'contract',
    initialState,

    reducers: {
        loadContractData: (state, action) => {

            state = action.payload;
            
            return state;
        }
    }
});

export const {loadContractData} = contractSlice.actions
export default contractSlice.reducer
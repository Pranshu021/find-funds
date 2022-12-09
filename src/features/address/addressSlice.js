import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: ''
}

export const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        changeAddress : (state, action) => {
            state.value = action.payload
            return state
        }
    },
})

export const {changeAddress} = addressSlice.actions
export default addressSlice.reducer
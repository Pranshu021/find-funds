import { configureStore } from '@reduxjs/toolkit'
import addressReducer from './features/address/addressSlice'
import contractReducer from './features/contracts/contractSlice'

export const store = configureStore({
    reducer: {
        address: addressReducer,
        contracts: contractReducer
    },
})
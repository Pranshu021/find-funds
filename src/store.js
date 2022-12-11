import { configureStore } from '@reduxjs/toolkit'
import addressReducer from './features/address/addressSlice'

export const store = configureStore({
    reducer: {
        address: addressReducer,
    },
})
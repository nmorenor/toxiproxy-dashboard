import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const doLogin = createAsyncThunk(
    'auth/login',
    async (data: { username: string, password: string }, thunkAPI) => {
        try {
            const response = await axios.post('/api/login', data)
            return response.data
        } catch (error) {
            console.log(error)
            return thunkAPI.rejectWithValue('Failed to login')
        }
    }
)
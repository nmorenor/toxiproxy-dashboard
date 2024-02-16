import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchProxies = createAsyncThunk(
    'proxies/fetchProxies',
    async (options: { token: string }, thunkAPI) => {
        try {
        const response = await axios.get('/api/toxiproxy/proxies', {
            headers: {
                'Authorization': `Bearer ${options.token}`,
            }
        })
        return response.data
        } catch (error) {
            console.log(error)
            return thunkAPI.rejectWithValue('Failed to fetch proxies')
        }
    }
)

export const fetchProxy = createAsyncThunk(
    'proxies/fetchProxy',
    async (options: { token: string, proxy: string }, thunkAPI) => {
        try {
            const response = await axios.get(`/api/toxiproxy/proxies/${options.proxy}`, {
                headers: {
                    'Authorization': `Bearer ${options.token}`,
                }
            })
            return response.data
        } catch (error) {
            console.log(error)
            return thunkAPI.rejectWithValue('Failed to fetch proxy')
        }
    }
)

export const addTimeoutToxic = createAsyncThunk(
    'proxies/addTimeoutToxic',
    async (options: { token: string, proxy: string }, thunkAPI) => {
        try {
            const reponse = await axios.post(`/api/toxiproxy/proxies/${options.proxy}/toxics`, {
                name: 'timeout',
                type: 'timeout',
                attributes: { timeout: 1000 },
                stream: 'downstream',
                toxicity: 1
            }, {
                headers: {
                    'Authorization': `Bearer ${options.token}`,
                }
            })

            return {
                proxy: options.proxy,
                toxic: reponse.data
            }
        } catch (error) {
            console.log(error)
            return thunkAPI.rejectWithValue('Failed to add timeout toxic')
        }
    }
)

export const addTimeoutCloseToxic = createAsyncThunk(
    'proxies/addTimeoutCloseToxic',
    async (options: { token: string, proxy: string }, thunkAPI) => {
        try {
            const response = await axios.post(`/api/toxiproxy/proxies/${options.proxy}/toxics`, {
                name: 'timeoutclose',
                type: 'timeoutclose',
                attributes: { timeout: 8000 },
                stream: 'downstream',
                toxicity: 1
            }, {
                headers: {
                    'Authorization': `Bearer ${options.token}`,
                }
            })
            return {
                proxy: options.proxy,
                toxic: response.data
            }
        } catch (error) {
            console.log(error)
            return thunkAPI.rejectWithValue('Failed to add timeoutclose toxic')
        }
    }
)

export const deleteToxic = createAsyncThunk(
    'proxies/deleteToxic',
    async (options: { token: string, proxy: string, toxic: string }, thunkAPI) => {
        try {
            await axios.delete(`/api/toxiproxy/proxies/${options.proxy}/toxics/${options.toxic}`, {
                headers: {
                    'Authorization': `Bearer ${options.token}`,
                }
            })
            return {
                proxy: options.proxy,
                toxic: options.toxic
            }
        } catch (error) {
            console.log(error)
            return thunkAPI.rejectWithValue('Failed to delete toxic')
        }
    }
)
import { createSlice } from '@reduxjs/toolkit'
import { addTimeoutCloseToxic, addTimeoutToxic, deleteToxic, fetchProxies, fetchProxy } from './proxies-thunk';

export interface Proxy {
    name: string;
    listen: string;
    upstream: string;
    enabled: boolean;
    toxics: Toxic[];
}

export interface Toxic {
    name: string;
    type: string;
    attributes: { [key: string]: string };
    stream: string;
    toxicity: number;
}

export type ProxyList = { [key: string]: Proxy };

export interface ProxiesState {
    isLoading: boolean
    proxies: ProxyList
}

const initialState: ProxiesState = {
    isLoading: false,
    proxies: {}
};

export const proxiesSlice = createSlice({
    name: 'proxies',
    initialState,
    reducers: {
        reset: (state) => {
            state.proxies = {}
            state.isLoading = false
        },
        setProxies: (state, action) => {
            state.proxies = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        extraReducers: (builder) => {
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProxies.pending, (state) => {
            state.isLoading = true
        }).addCase(fetchProxies.fulfilled, (state, action) => {
            state.proxies = action.payload
            state.isLoading = false
        }).addCase(fetchProxies.rejected, (state) => {
            state.isLoading = false
        }).addCase(fetchProxy.pending, (state) => {
            state.isLoading = true
        }).addCase(fetchProxy.fulfilled, (state, action) => {
            const target = Object.assign({}, state.proxies)
            target[action.payload.name] = action.payload
            state.proxies = target
            state.isLoading = false
        }).addCase(fetchProxy.rejected, (state) => {
            state.isLoading = false
        }).addCase(addTimeoutToxic.pending, (state) => {
            state.isLoading = true
        }).addCase(addTimeoutToxic.fulfilled, (state, action) => {
            const target = Object.assign({}, state.proxies)
            if (target[action.payload.proxy]) {
                target[action.payload.proxy].toxics.push(action.payload.toxic)
            }
            state.proxies = target
            state.isLoading = false
        }).addCase(addTimeoutToxic.rejected, (state) => {
            state.isLoading = false
        }).addCase(addTimeoutCloseToxic.pending, (state) => {
            state.isLoading = true
        }).addCase(addTimeoutCloseToxic.fulfilled, (state, action) => {
            const target = Object.assign({}, state.proxies)
            if (target[action.payload.proxy]) {
                target[action.payload.proxy].toxics.push(action.payload.toxic)
            }
            state.proxies = target
            state.isLoading = false
        }).addCase(addTimeoutCloseToxic.rejected, (state) => {
            state.isLoading = false
        }).addCase(deleteToxic.pending, (state) => {
            state.isLoading = true
        }).addCase(deleteToxic.fulfilled, (state, action) => {
            const target = Object.assign({}, state.proxies)
            if (target[action.payload.proxy]) {
                target[action.payload.proxy].toxics = target[action.payload.proxy].toxics.filter((toxic) => toxic.name !== action.payload.toxic)
            }
            state.proxies = target
            state.isLoading = false
        }).addCase(deleteToxic.rejected, (state) => {
            state.isLoading = false
        });
    }
});

export const { reset, setProxies, setLoading } = proxiesSlice.actions
export const proxiesReducer = proxiesSlice.reducer
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { persistReducer } from "redux-persist";
import { authReducer } from './slices/auth-slice';
import storage from './custom-storage';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { proxiesReducer } from './slices/proxies-slice';

const authPersistConfig = {
    key: 'auth',
    storage: storage,
    whitelist: ['isAuthenticated', 'token']
}

const proxyPersistConfig = {
    key: 'proxies',
    storage: storage,
    whitelist: ['proxies']
}

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    proxies: persistReducer(proxyPersistConfig, proxiesReducer)
})

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }).concat(logger as any, thunk),
    enhancers: [ ],
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
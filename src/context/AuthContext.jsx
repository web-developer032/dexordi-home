import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
import useMultiWallet from "../hooks/useMultiWallet";

const authActions = {
    SET_THEME: "SET_THEME",
    UPDATE_THEME: "UPDATE_THEME",
    SET_USER: "SET_USER",
    DELETE_USER: "DELETE_USER",
};

const initialState = {
    preferDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    token: "",
    user: null,
    wallet: 1,
    network: 1,
};

const reducer = (state, { type, payload }) => {
    switch (type) {
        case authActions.SET_THEME: {
            console.log('SET_THEME', payload.preferDark);
            localStorage.setItem('theme', payload.preferDark);
            return {
                ...state,
                preferDark: payload.preferDark,
            };
        }
        case authActions.UPDATE_THEME: {
            localStorage.setItem('theme', !state.preferDark);
            return {
                ...state,
                preferDark: !state.preferDark,
            };
        }

        case authActions.SET_USER: {
            return {
                ...state,
                user: { ...payload },
            };
        }

        case authActions.DELETE_USER: {
            return {
                token: "",
                user: null,
            };
        }

        default:
            return state;
    }
};

export const AuthContext = createContext({
    walletContext: {
        walletIndex: 0,
        setWalletIndex: () => { }
    },
    authState: initialState,
    authDispatch: () => { },
    updateToken: () => { },
    updateTheme: () => { },
    updateUser: () => { },
    deleteUser: () => { },
});

export function AuthStateProvider({ children }) {
    const [authState, authDispatch] = useReducer(reducer, initialState);
    const [walletIndex, setWalletIndex, connectWallet, address, connected, network] = useMultiWallet();

    function updateToken(payload = "") {
        authDispatch({ type: authActions.SET_TOKEN, payload });
    }

    function updateUser(payload = {}) {
        authDispatch({ type: authActions.SET_USER, payload });
    }

    function updateTheme() {
        authDispatch({ type: authActions.UPDATE_THEME });
    }

    function deleteUser() {
        authDispatch({ type: authActions.DELETE_USER });
    }

    useEffect(() => {
        const isdark = localStorage.getItem('theme');
        console.log('isDark :>> ', isdark);
        authDispatch({ type: authActions.SET_THEME, payload: { preferDark: isdark == 'true' } })
    }, [])


    return (
        <AuthContext.Provider
            value={{
                walletContext: { walletIndex, setWalletIndex, connectWallet, address, connected, network },
                authState, authDispatch, updateToken, updateTheme, updateUser, deleteUser
            }
            }

        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthState() {
    const authContext = useContext(AuthContext);

    return authContext;
}

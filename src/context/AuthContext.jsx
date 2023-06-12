import React, { createContext, useContext, useReducer } from "react";

const authActions = {
    SET_TOKEN: "SET_TOKEN",
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
        case authActions.SET_TOKEN: {
            return {
                ...state,
                token: payload,
            };
        }
        case authActions.UPDATE_THEME: {
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
    authState: initialState,
    authDispatch: () => {},
    updateToken: () => {},
    updateTheme: () => {},
    updateUser: () => {},
    deleteUser: () => {},
});

export function AuthStateProvider({ children }) {
    const [authState, authDispatch] = useReducer(reducer, initialState);

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

    return (
        <AuthContext.Provider
            value={{ authState, authDispatch, updateToken, updateTheme, updateUser, deleteUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthState() {
    const authContext = useContext(AuthContext);

    return authContext;
}

import React from "react";
import { Route, Routes } from "react-router-dom";
import { withOutLayoutRoutes } from "./routes/routesList";
import { useAuthState } from "./context/AuthContext";

function App() {
    const { authState } = useAuthState();
    return (
        <main className={`${authState.preferDark ? "dark-theme" : ""}`}>
            <Routes>
                {withOutLayoutRoutes.map(({ Element, ...route }) => {
                    return (
                        <Route key={route.path} path={route.path} element={<Element />}>
                            {route.children &&
                                route.children.map(({ Element, ...childRoute }) => (
                                    <Route
                                        key={childRoute.path}
                                        path={childRoute.path}
                                        element={<Element />}
                                        index={childRoute.index}
                                    />
                                ))}
                        </Route>
                    );
                })}
            </Routes>
        </main>
    );
}

export default App;

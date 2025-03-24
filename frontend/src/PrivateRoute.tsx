import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const PrivateRoute = () => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [onboarding, setOnboarding] = useState(null);
	const location = useLocation();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/status`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(data.authenticated);
					setOnboarding(data.onboarding);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('authentication check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

	if (isAuthenticated && onboarding && ['/step1', '/step2', '/step3', '/step4'].includes(location.pathname)) {
        return <Navigate to="/home" />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};

export const AuthRoute = () => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/status`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(data.authenticated);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('authentication check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/home" />;
    }

    return <Outlet />;
};

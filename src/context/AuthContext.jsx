import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to update document title
    const updateTitle = (userData) => {
        if (userData) {
            const role = userData.role || 'User';
            document.title = `Office Task App (${role})`;
        } else {
            document.title = 'Office Task App';
        }
    };

    useEffect(() => {
        // Check if user is logged in from localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            updateTitle(userData);
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        updateTitle(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        updateTitle(null);
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
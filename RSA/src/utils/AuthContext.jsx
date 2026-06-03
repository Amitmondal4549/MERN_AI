
import { createContext, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {

    const login = localStorage.getItem('isLogin') === 'true';

    const getUserInfo = () => {
        try {
            const data = localStorage.getItem("userInfo");
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.error("Failed to parse userInfo from localStorage:", err);
            localStorage.removeItem("userInfo");
            return null;
        }
    };

    const [isLogin, setlogin] = useState(login);
    const [userInfo, setUserInfo] = useState(getUserInfo);

    return (
        <AuthContext.Provider value={{ isLogin, setlogin, userInfo, setUserInfo }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
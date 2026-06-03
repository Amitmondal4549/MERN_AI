import { createContext, useState, useCallback } from "react";

export const AuthContext = createContext();

const TOKEN_KEY = "firebase_token";

function getStorageItem(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

const AuthProvider = ({ children }) => {
  const [isLogin, setlogin] = useState(() => localStorage.getItem("isLogin") === "true");
  const [userInfo, setUserInfo] = useState(() => getStorageItem("userInfo"));
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const saveToken = useCallback((t) => {
    if (t) {
      localStorage.setItem(TOKEN_KEY, t);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(t);
  }, []);

  const loginUser = useCallback((user, t) => {
    localStorage.setItem("userInfo", JSON.stringify(user));
    localStorage.setItem("isLogin", "true");
    saveToken(t);
    setUserInfo(user);
    setlogin(true);
  }, [saveToken]);

  const logoutUser = useCallback(() => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("isLogin");
    saveToken(null);
    setUserInfo(null);
    setlogin(false);
  }, [saveToken]);

  return (
    <AuthContext.Provider value={{ isLogin, setlogin, userInfo, setUserInfo, token, saveToken, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
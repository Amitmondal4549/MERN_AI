import { createContext, useState, useCallback, useEffect } from "react";
import axios from "./axios";

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

  // Verify session on mount: call GET /api/user to confirm token is still valid
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedIsLogin = localStorage.getItem("isLogin") === "true";

    if (savedIsLogin && savedToken) {
      console.log('[Auth] Verifying session with backend...');
      axios.get('/user')
        .then((res) => {
          const user = res.data.user;
          if (user) {
            console.log('[Auth] Session verified:', user.email);
            setUserInfo(user);
            setlogin(true);
            localStorage.setItem("userInfo", JSON.stringify(user));
            localStorage.setItem("isLogin", "true");
          } else {
            console.warn('[Auth] Session invalid — no user in response');
            logoutUserCleanup();
          }
        })
        .catch((err) => {
          console.error('[Auth] Session verification failed:', err.response?.status, err.response?.data || err.message);
          logoutUserCleanup();
        });
    } else {
      console.log('[Auth] No saved session found');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logoutUserCleanup() {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("isLogin");
    localStorage.removeItem(TOKEN_KEY);
    setUserInfo(null);
    setlogin(false);
    setToken(null);
  }

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
    console.log('[Auth] loginUser — user saved, isLogin=true');
  }, [saveToken]);

  const logoutUser = useCallback(() => {
    logoutUserCleanup();
  }, []);

  return (
    <AuthContext.Provider value={{ isLogin, setlogin, userInfo, setUserInfo, token, saveToken, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
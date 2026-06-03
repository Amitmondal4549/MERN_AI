import { useContext, useState } from 'react'
import styles from './Login.module.css';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import GoogleIcon from '@mui/icons-material/Google';
import { CircularProgress } from '@mui/material';
import { auth, provider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { AuthContext } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../utils/ToastContext';
import axios from '../../utils/axios';

const Login = () => {

  const { setlogin, setUserInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const idToken = await user.getIdToken();
      const userData = {
        name: user.displayName,
        email: user.email,
        photoUrl: user.photoURL
      }

      const response = await axios.post('/user', userData, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const loggedInUser = response.data.user;

      if (!loggedInUser || !loggedInUser._id) {
        toast("Login failed: User data not received from server.", "error");
        setLoading(false);
        return;
      }

      setUserInfo(loggedInUser);
      setlogin(true);
      localStorage.setItem("userInfo", JSON.stringify(loggedInUser));
      localStorage.setItem("isLogin", 'true');
      navigate('/dashboard');

    } catch (err) {
      const message = err.response?.data?.error || "Something went wrong. Please try again.";
      toast(message, "error");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.Login}>
      <div className={styles.loginCard}>
        <div className={styles.loginCardTitle}>
          <h1>Login</h1>
          <VpnKeyIcon />
        </div>
        <div
          className={`${styles.googleBtn} ${loading ? styles.disabledBtn : ''}`}
          onClick={loading ? null : handleLogin}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleLogin()}
          aria-label={loading ? "Signing in" : "Sign in with Google"}
        >
          <GoogleIcon sx={{ fontSize: 20, color: "red" }} />
          {loading ? <CircularProgress size={20} sx={{ ml: 1 }} /> : "Sign in with Google"}
        </div>
      </div>
    </div>
  )
}

export default Login
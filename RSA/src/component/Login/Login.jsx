import { useContext, useState } from 'react'
import styles from './Login.module.css';
import GoogleIcon from '@mui/icons-material/Google';
import DescriptionIcon from '@mui/icons-material/Description';
import { CircularProgress } from '@mui/material';
import { auth, provider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { AuthContext } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../utils/ToastContext';
import axios from '../../utils/axios';

const Login = () => {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      console.log('[Auth] Firebase ID token received:', idToken ? 'present' : 'missing');

      // Save token to localStorage BEFORE making the backend request
      // so the Axios interceptor picks it up and attaches it as Authorization header.
      localStorage.setItem('firebase_token', idToken);
      console.log('[Auth] Token saved to localStorage');

      console.log('[Auth] Sending POST /api/user with token attached via interceptor');
      const response = await axios.post('/user', {
        name: user.displayName,
        email: user.email,
        photoUrl: user.photoURL,
      });
      console.log('[Auth] POST /api/user response:', response.status, response.data);

      const loggedInUser = response.data.user;

      if (!loggedInUser || !loggedInUser._id) {
        toast("Login failed: User data not received from server.", "error");
        setLoading(false);
        return;
      }

      loginUser(loggedInUser, idToken);
      console.log('[Auth] User logged in successfully:', loggedInUser.email);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || "Something went wrong. Please try again.";
      console.error('[Auth] Login failed:', err.response?.status, err.response?.data || err.message);
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.Login}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <DescriptionIcon sx={{ fontSize: 48 }} />
          <h1>Resume Match Score</h1>
          <p>AI-Powered Resume Screening</p>
        </div>
        <button
          className={`${styles.googleBtn} ${loading ? styles.disabledBtn : ''}`}
          onClick={loading ? undefined : handleLogin}
          disabled={loading}
        >
          <GoogleIcon sx={{ fontSize: 20 }} />
          {loading ? <CircularProgress size={20} sx={{ ml: 1 }} /> : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
};

export default Login
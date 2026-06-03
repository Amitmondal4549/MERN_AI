import { useEffect, useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../AuthContext"
import { CircularProgress } from "@mui/material"

const WithAuthHoc = (WrappedComponent) => {
  return (Props) => {
    const navigate = useNavigate();
    const { setlogin } = useContext(AuthContext);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const isLogin = localStorage.getItem('isLogin');

      if (!isLogin) {
        setlogin(false);
        navigate('/');
        return;
      }

      setChecking(false);
    }, [navigate, setlogin]);

    if (checking) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
      );
    }

    return <WrappedComponent {...Props} />;
  }
}

export default WithAuthHoc;

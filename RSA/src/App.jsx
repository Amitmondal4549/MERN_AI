import { useContext, lazy, Suspense } from 'react'
import SideBar from './component/SideBar/SideBar'
import { Routes, Route } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { AuthContext } from './utils/AuthContext';
import './App.css';

const Login = lazy(() => import('./component/Login/Login'));
const Dashboard = lazy(() => import('./component/Dashboard/Dashboard'));
const History = lazy(() => import('./component/History/History'));
const Admin = lazy(() => import('./component/Admin/Admin'));

function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>404</h1>
      <p>Page not found</p>
      <a href="/">Go to Login</a>
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </div>
  );
}

function App() {
  const { isLogin } = useContext(AuthContext);

  return (
    <div className='App'>
      {isLogin && <SideBar />}
      <div className='content'>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/history' element={<History />} />
            <Route path='/admin' element={<Admin />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  )
}

export default App

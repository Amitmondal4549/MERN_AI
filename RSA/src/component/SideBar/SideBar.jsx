import { useContext, useState, useEffect } from 'react'
import styles from './SideBar.module.css'
import ArticleIcon from '@mui/icons-material/Article';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../utils/AuthContext';

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLogin, userInfo, logoutUser } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(() => {
    const w = window.innerWidth;
    return w >= 641 && w <= 1024;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  }

  if (!isLogin) return null;

  const navItems = [
    { to: '/dashboard', icon: <DashboardIcon sx={{ fontSize: 22 }} />, label: 'Dashboard' },
    { to: '/history', icon: <HistoryIcon sx={{ fontSize: 22 }} />, label: 'History' },
    ...(userInfo?.role === 'admin' ? [{ to: '/admin', icon: <AdminPanelSettingsIcon sx={{ fontSize: 22 }} />, label: 'Admin' }] : []),
  ];

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <MenuIcon />
      </button>

      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      <div className={`${styles.sideBar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sideBarHeader}>
          <div className={styles.sideBarIcon}>
            <ArticleIcon sx={{ fontSize: collapsed ? 28 : 54 }} />
            <div className={collapsed ? styles.brandTextHidden : styles.sideBarTopContent}>
              Resume Screening
            </div>
          </div>
          <button
            className={styles.closeMobile}
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <ChevronLeftIcon />
          </button>
        </div>

        <div className={styles.sideBarOptionsBlock}>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`${styles.sideBarOption} ${location.pathname === item.to ? styles.selectedOption : ''}`}
            >
              {item.icon}
              <div className={collapsed ? styles.navLabelHidden : styles.navLabel}>{item.label}</div>
            </Link>
          ))}
        </div>

        <div className={styles.sideBarFooter}>
          <div onClick={handleLogout} className={styles.sideBarOption}>
            <LogoutIcon sx={{ fontSize: 22 }} />
            <div className={collapsed ? styles.navLabelHidden : styles.navLabel}>LogOut</div>
          </div>
          <button
            className={styles.collapseToggle}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeftIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
          </button>
        </div>
      </div>
    </>
  )
}

export default SideBar
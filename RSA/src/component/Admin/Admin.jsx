import { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import WithAuthHoc from '../../utils/HOC/withAuthHoc';
import { useToast } from '../../utils/ToastContext';
import axios from '../../utils/axios';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, resumeRes] = await Promise.all([
          axios.get('/user/stats'),
          axios.get('/resume/get'),
        ]);
        setStats(statsRes.data);
        setResumes(resumeRes.data.resumes || []);
      } catch (err) {
        if (err.response?.status === 403) {
          toast("Admin access required", "error");
        } else {
          toast("Failed to load admin data", "error");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.Admin}>
        <div className={styles.pageHeader}>Admin Dashboard</div>
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={styles.statSkeleton} />
          ))}
        </div>
        <div className={styles.listSkeleton} />
        <div className={styles.listSkeleton} />
        <div className={styles.listSkeleton} />
      </div>
    );
  }

  return (
    <div className={styles.Admin}>
      <div className={styles.pageHeader}>
        <AssessmentIcon sx={{ fontSize: 24 }} />
        <div>
          <h1>Admin Dashboard</h1>
          <p>System overview and user activity</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eef2ff', color: '#4848de' }}>
            <PeopleIcon />
          </div>
          <div>
            <div className={styles.statNumber}>{stats?.totalUsers ?? '-'}</div>
            <div className={styles.statLabel}>Total Users</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <DescriptionIcon />
          </div>
          <div>
            <div className={styles.statNumber}>{stats?.totalAnalyses ?? '-'}</div>
            <div className={styles.statLabel}>Total Analyses</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <PersonIcon />
          </div>
          <div>
            <div className={styles.statNumber}>{stats?.recentAnalyses?.length ?? '-'}</div>
            <div className={styles.statLabel}>Recent Uploads</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <AssessmentIcon />
          </div>
          <div>
            <div className={styles.statNumber}>
              {stats?.totalAnalyses && stats?.totalUsers
                ? (stats.totalAnalyses / Math.max(stats.totalUsers, 1)).toFixed(1)
                : '-'}
            </div>
            <div className={styles.statLabel}>Avg. per User</div>
          </div>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className={styles.sectionTitle}>Recent Analyses</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Resume</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {resumes.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.noData}>No analyses yet</td>
              </tr>
            )}
            {resumes.slice(0, 20).map((item) => (
              <tr key={item._id}>
                <td className={styles.cellName}>
                  {item.user ? (
                    <>
                      <PersonIcon sx={{ fontSize: 16 }} />
                      {item.user.name || 'N/A'}
                    </>
                  ) : 'Deleted User'}
                </td>
                <td className={styles.cellEmail}>{item.user?.email || '—'}</td>
                <td>{item.resume_name}</td>
                <td><span className={styles.scoreBadge}>{item.score || '?'}%</span></td>
                <td className={styles.cellDate}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithAuthHoc(Admin);

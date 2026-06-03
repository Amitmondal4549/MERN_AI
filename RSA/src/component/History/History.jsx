import styles from './History.module.css';
import WithAuthHoc from '../../utils/HOC/withAuthHoc';
import { useState, useEffect, useContext, useCallback } from 'react';
import { useToast } from '../../utils/ToastContext';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

const History = () => {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const { userInfo } = useContext(AuthContext);
  const toast = useToast();

  const fetchUserData = useCallback(async () => {
    if (!userInfo?._id) return;
    setLoader(true);
    try {
      const results = await axios.get(`/resume/get/${userInfo._id}`);
      setData(results.data.resumes || []);
    } catch (err) {
      const message = err.response?.data?.error || "Something went wrong";
      toast(message, "error");
    } finally {
      setLoader(false);
    }
  }, [userInfo?._id, toast]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <div className={styles.History}>
      <div className={styles.pageHeader}>
        <HistoryIcon sx={{ fontSize: 24 }} />
        <div>
          <h1>Analysis History</h1>
          <p>Your previous resume analyses</p>
        </div>
      </div>

      {loader && (
        <div className={styles.loadingGrid}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.skeleton} />
          ))}
        </div>
      )}

      {!loader && data.length === 0 && (
        <div className={styles.emptyState}>
          <DescriptionOutlinedIcon sx={{ fontSize: 48, color: '#ccc' }} />
          <h3>No analyses yet</h3>
          <p>Upload your first resume on the Dashboard to see results here.</p>
        </div>
      )}

      {!loader && data.length > 0 && (
        <div className={styles.grid}>
          {data.map((item) => (
            <div key={item._id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.score}>{item.score || '?'}%</span>
                <span className={styles.date}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
              <p className={styles.resumeName}>{item.resume_name}</p>
              {item.feedback && (
                <p className={styles.feedback}>{item.feedback}</p>
              )}
              {item.skills && item.skills.length > 0 && (
                <div className={styles.skills}>
                  {item.skills.slice(0, 4).map((s, i) => (
                    <span key={i} className={styles.skillTag}>{s}</span>
                  ))}
                  {item.skills.length > 4 && (
                    <span className={styles.skillTag}>+{item.skills.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WithAuthHoc(History);

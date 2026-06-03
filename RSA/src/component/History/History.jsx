import styles from './History.module.css';
import Skeleton from '@mui/material/Skeleton';
import WithAuthHoc from '../../utils/HOC/withAuthHoc';
import { useState, useEffect, useContext, useCallback } from 'react';
import { useToast } from '../../utils/ToastContext';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';

const History = () => {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const { userInfo } = useContext(AuthContext);
  const toast = useToast();

  const fetchUserData = useCallback(async () => {
    if (!userInfo?._id) return;
    setLoader(true);
    try {
      const results = await axios.get(`/resume/get/${userInfo._id}`)
      setData(results.data.resumes)
    } catch (err) {
      const message = err.response?.data?.error || "Something went wrong";
      toast(message, "error");
      console.error(err);
    } finally {
      setLoader(false)
    }
  }, [userInfo?._id, toast]);

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])
  return (
    <div>
      <div className={styles.History}>
        <div className={styles.HistoryCardBlock}>
          {
            loader && <>
            <Skeleton
              variant="rectangular"
              sx={{ borderRadius: "20px" }}
              width={250}
              height={250}
            /><Skeleton
              variant="rectangular"
              sx={{ borderRadius: "20px" }}
              width={250}
              height={250}
            /><Skeleton
              variant="rectangular"
              sx={{ borderRadius: "20px" }}
              width={250}
              height={250}
            />
            </>
          }

          {
            data.map((item, index) => {
              return (
                <div className={styles.HistoryCard}>
                  <div  key={item._id} className={styles.cardPercentage}>{item.score}%</div>
                  {/* <h2>{}</h2> */}
                  <p>Resume Name : {item.resume_name}</p>
                  <p>{item.feedback}</p>
                  <p>Dated : {item.createdAt.slice(0, 10)}</p>
                </div>
              );
            })
          }

        </div>
      </div>
    </div>
  )
}

export default WithAuthHoc(History)

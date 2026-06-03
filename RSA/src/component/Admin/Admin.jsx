import { useState, useEffect } from 'react'
import styles from './Admin.module.css';
import Skeleton from '@mui/material/Skeleton';
import WithAuthHoc from '../../utils/HOC/withAuthHoc';
import { useToast } from '../../utils/ToastContext';
import axios from '../../utils/axios';

const Admin = () => {

  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoader(true)
      try {
        const results = await axios.get('/resume/get')
        setData(results.data.resumes)
      } catch (err) {
        const message = err.response?.data?.error || "Something went wrong";
        toast(message, "error");
        console.error(err)
      } finally {
        setLoader(false);
      }
    }
    fetchAllData();
  }, []);
  return (
    <div className={styles.Admin}>
      <div className={styles.AdminBlock}>

        {
          loader && <>
            <Skeleton
              variant="rectangular"
              sx={{ borderRadius: "20px" }}
              width={266}
              height={400}
            />
            <Skeleton
              variant="rectangular"
              sx={{ borderRadius: "20px" }}
              width={266}
              height={400}
            />
            <Skeleton
              variant="rectangular"
              sx={{ borderRadius: "20px" }}
              width={266}
              height={400}
            />
            <Skeleton
              variant="rectangular"
              sx={{ borderRadius: "20px" }}
              width={266}
              height={400}
            />
          </>
        }


        {
          data.map((item, index) => {
            return (
              <div key={item._id} className={styles.AdminCard}>
                <h2>{item?.user?.name}</h2>
                <p style={{ color: "#4848de" }}>{item?.user?.email}</p>
                <h3>Score : {item.score}%</h3>
                <p>{item.feedback}</p>
              </div>
            )
          })
        }

      </div>
    </div>
  )
}

export default WithAuthHoc(Admin)


import { useState, useContext } from 'react'
import styles from './Dashboard.module.css';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import Skeleton from '@mui/material/Skeleton';
import WithAuthHoc from '../../utils/HOC/withAuthHoc';
import { useToast } from '../../utils/ToastContext';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';

const Dashboard = () => {
    const [uploadFiletext, setUploadFileText] = useState("Upload your resume");
    const [loading, setLoading] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [JobDesc, setJobDesc] = useState("");
    const [result, setResult] = useState(null);
    const { userInfo } = useContext(AuthContext);
    const toast = useToast();

    const handleOnChangeFile = (e) => {
        setResumeFile(e.target.files[0]);
        setUploadFileText(e.target.files[0].name);
    }

    const handleUpload = async () => {
        setResult(null);

        if (!JobDesc || !resumeFile) {
            toast("Please fill job description and upload a resume", "warning");
            return;
        }

        if (!userInfo || !userInfo._id) {
            toast("User not authenticated. Please log in again.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("resume", resumeFile);
        formData.append("job_desc", JobDesc);
        formData.append("user", userInfo._id);
        setLoading(true);

        try {
            const result = await axios.post('/resume/addresume', formData);
            setResult(result.data.data);
            toast("Analysis complete!", "success");
        } catch (err) {
            const message = err.response?.data?.error || "Analysis failed. Please try again.";
            toast(message, "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.Dashboard}>
            <div className={styles.DashboardLeft}>
                <div className={styles.DashboardHeader}>
                    <div className={styles.DashboardHeaderTitle}>Smart Resume Screening</div>
                    <div className={styles.DashboardHeaderLargeTitle}>Resume Match Score</div>
                </div>

                <div className={styles.alertInfo}>
                    <div>🔔 Important Instruction</div>
                    <div className={styles.dashboardInstruction}>
                        <div>📄 Please Paste the complete job description in the "Job Description" field before submitting.</div>
                        <div>📎 Only PDF format (.pdf) resumes are accepted.</div>
                    </div>
                </div>

                <div className={styles.DashboardUploadResume}>
                    <div className={styles.DashboardResumeBlock}>
                        {uploadFiletext}
                    </div>
                    <div className={styles.DashboardInputField}>
                        <label htmlFor='inputField' className={styles.analyzeAIBtn}>Upload Resume</label>
                        <input type='file' accept=".pdf" id='inputField' onChange={handleOnChangeFile} />
                    </div>
                </div>

                <div className={styles.jobDesc}>
                    <textarea
                        value={JobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                        className={styles.textArea}
                        placeholder='Paste Your Job Description'
                        rows={10}
                        cols={50}
                    />
                    <div className={styles.AnalyzeBtn} onClick={handleUpload}>Analyze</div>
                </div>
            </div>

            <div className={styles.DashboardRight}>
                <div className={styles.DashboardRightTopCard}>
                    <div>Analyze with AI</div>
                    <img
                        className={styles.profileImg}
                        src={userInfo?.photoUrl}
                        referrerPolicy="no-referrer"
                        onError={(e) => e.target.src = "/default-avatar.png"}
                    />
                    <h2>{userInfo?.name}</h2>
                </div>

                {result && (
                    <div className={styles.DashboardRightTopCard}>
                        <div>Result</div>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
                            <h1>{result?.score}</h1>
                            <SignalCellularAltIcon sx={{ fontSize: 22 }} />
                        </div>
                        <div className={styles.feedback}>
                            <h3>Feedback</h3>
                            <p>{result?.feedback}</p>
                        </div>
                    </div>
                )}

                {loading && (
                    <Skeleton variant="rectangular" sx={{ borderRadius: "20px" }} width={280} height={280} />
                )}
            </div>
        </div>
    )
}

export default WithAuthHoc(Dashboard);

import { useState, useContext } from 'react'
import styles from './Dashboard.module.css';
import WithAuthHoc from '../../utils/HOC/withAuthHoc';
import { useToast } from '../../utils/ToastContext';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BoltIcon from '@mui/icons-material/Bolt';

function ResultCard({ title, icon, items, color }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={styles.resultCard}>
      <div className={styles.resultCardHeader} style={{ color }}>
        {icon}
        <span>{title}</span>
      </div>
      <ul className={styles.resultList}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

const Dashboard = () => {
  const [uploadFiletext, setUploadFileText] = useState("Upload your resume");
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [JobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const { userInfo } = useContext(AuthContext);
  const toast = useToast();

  const handleOnChangeFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setUploadFileText(file.name);
    }
  };

  const handleUpload = async () => {
    setResult(null);

    if (!JobDesc || !resumeFile) {
      toast("Please fill job description and upload a resume", "warning");
      return;
    }
    if (JobDesc.trim().length < 10) {
      toast("Job description must be at least 10 characters", "warning");
      return;
    }
    if (!userInfo || !userInfo._id) {
      toast("User not authenticated. Please log in again.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_desc", JobDesc.trim());
    formData.append("user", userInfo._id);
    setLoading(true);

    try {
      const res = await axios.post('/resume/addresume', formData);
      setResult(res.data.data);
      toast("Analysis complete!", "success");
    } catch (err) {
      const message = err.response?.data?.error || "Analysis failed. Please try again.";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.Dashboard}>
      {/* Top Welcome Bar */}
      <div className={styles.welcomeBar}>
        <div>
          <h1>Welcome, {userInfo?.name?.split(' ')[0] || 'User'}</h1>
          <p>Upload a resume and job description to get an AI-powered match analysis</p>
        </div>
        <img
          className={styles.avatar}
          src={userInfo?.photoUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </div>

      {/* Main two-column layout */}
      <div className={styles.mainGrid}>
        {/* Left Column — Input */}
        <div className={styles.inputColumn}>
          {/* Resume Upload Card */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <UploadFileIcon sx={{ fontSize: 20 }} />
              Upload Resume
            </div>
            <div className={styles.uploadArea}>
              <div className={styles.uploadPlaceholder}>
                {resumeFile ? (
                  <span className={styles.fileName}>{uploadFiletext}</span>
                ) : (
                  <>
                    <UploadFileIcon sx={{ fontSize: 40, color: '#bbb' }} />
                    <span>Click to upload your PDF resume</span>
                  </>
                )}
              </div>
              <label htmlFor="resumeInput" className={styles.uploadBtn}>
                {resumeFile ? "Change File" : "Choose File"}
              </label>
              <input type="file" accept=".pdf" id="resumeInput" onChange={handleOnChangeFile} />
            </div>
          </div>

          {/* Job Description Card */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <AutoAwesomeIcon sx={{ fontSize: 20 }} />
              Job Description
            </div>
            <textarea
              value={JobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className={styles.textArea}
              placeholder="Paste the full job description here..."
              rows={8}
            />
          </div>

          {/* Analyze Button */}
          <button
            className={styles.analyzeBtn}
            onClick={handleUpload}
            disabled={loading || !resumeFile || !JobDesc}
          >
            {loading ? (
              <>Analyzing...</>
            ) : (
              <><BoltIcon sx={{ fontSize: 20 }} /> Analyze Match</>
            )}
          </button>
        </div>

        {/* Right Column — Results */}
        <div className={styles.resultsColumn}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Analyzing your resume against the job description...</p>
            </div>
          )}

          {!loading && !result && (
            <div className={styles.emptyState}>
              <PsychologyIcon sx={{ fontSize: 64, color: '#ccc' }} />
              <h3>Ready to analyze</h3>
              <p>Upload a resume and paste a job description, then click "Analyze Match"</p>
            </div>
          )}

          {result && (
            <>
              {/* Score Card */}
              <div className={styles.scoreCard}>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreNumber}>{result.score || '?'}</span>
                  <span className={styles.scoreLabel}>Match Score</span>
                </div>
                <div className={styles.scoreDetails}>
                  {result.skills?.length > 0 && (
                    <div className={styles.skillTags}>
                      {result.skills.map((s, i) => (
                        <span key={i} className={styles.skillTag}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback */}
              {result.feedback && (
                <div className={styles.feedbackBox}>
                  <p>{result.feedback}</p>
                </div>
              )}

              {/* Strengths */}
              <ResultCard
                title="Strengths"
                icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                items={result.strengths}
                color="#16a34a"
              />

              {/* Weaknesses */}
              <ResultCard
                title="Areas to Improve"
                icon={<WarningAmberIcon sx={{ fontSize: 18 }} />}
                items={result.weaknesses}
                color="#dc2626"
              />

              {/* Missing Skills */}
              <ResultCard
                title="Missing Skills"
                icon={<WarningAmberIcon sx={{ fontSize: 18 }} />}
                items={result.missing_skills}
                color="#f59e0b"
              />

              {/* Suggestions */}
              <ResultCard
                title="Suggestions"
                icon={<TipsAndUpdatesIcon sx={{ fontSize: 18 }} />}
                items={result.suggestions}
                color="#2563eb"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithAuthHoc(Dashboard);

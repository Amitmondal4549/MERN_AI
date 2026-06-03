const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    resume_name: { type: String, required: true },
    job_desc: { type: String, required: true },
    score: { type: String },
    feedback: { type: String },
    skills: [{ type: String }],
    missing_skills: [{ type: String }],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestions: [{ type: String }],
}, { timestamps: true });

const resumeModel = mongoose.model("resume", ResumeSchema);

module.exports = resumeModel;
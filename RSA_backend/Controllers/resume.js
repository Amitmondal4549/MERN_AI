const ResumeModel = require('../Models/resume');
const pdfParseLib = require("pdf-parse");
const pdfParse = pdfParseLib.default || pdfParseLib;
const path = require("path");
const { CohereClientV2 } = require("cohere-ai");
const fs = require("fs");
const { success, error } = require('../utils/response');

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

function truncateText(text, maxLength = 8000) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "\n\n[...resume truncated due to length]";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callCohereWithRetry(prompt, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await cohere.chat({
        model: "command-a-03-2025",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      });
      return response;
    } catch (err) {
      if (attempt < retries) {
        console.warn(`Cohere API attempt ${attempt + 1} failed, retrying...`);
        await sleep(1000 * (attempt + 1));
      } else {
        throw err;
      }
    }
  }
}

exports.addResume = async (req, res, next) => {
  try {
    const { job_desc, user } = req.body;

    if (!req.file) {
      return error(res, "Resume file is required", 400);
    }

    const pdfPath = req.file.path;
    const dataBuffer = await fs.promises.readFile(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = truncateText(pdfData.text);

    const prompt = [
      'You are an expert ATS (Applicant Tracking System) screener.',
      '',
      'Analyze how well the following resume matches the job description.',
      'Evaluate on these dimensions:',
      '1. **Skills match** — hard skills & technologies mentioned in both',
      '2. **Experience level** — years and relevance of experience',
      '3. **Education** — degree and field alignment',
      '4. **Keywords** — presence of JD-specific terminology',
      '',
      'Resume:',
      resumeText,
      '',
      'Job Description:',
      job_desc,
      '',
      'Return your analysis in this exact format:',
      'Score: <number 0-100>',
      'Reason: <2-3 sentence explanation focusing on key strengths and gaps>',
    ].join('\n');

    const response = await callCohereWithRetry(prompt);

    let result = response.message.content[0].text;
    const match = result.match(/Score:\s*(\d+)/);
    const score = match ? match[1] : null;
    const reasonMatch = result.match(/Reason:\s*([\s\S]*)/);
    const reason = reasonMatch ? reasonMatch[1].trim() : null;

    const newResume = new ResumeModel({
      user,
      resume_name: req.file.originalname,
      job_desc,
      score,
      feedback: reason,
    });

    await newResume.save();
    await fs.promises.unlink(pdfPath);

    success(res, { data: newResume }, "Your analysis is ready");
  } catch (err) {
    console.error(`[${req.requestId}] addResume error:`, err.message);
    next(err);
  }
};

exports.getAllResumesForUser = async (req, res, next) => {
  try {
    const { user } = req.params;
    let resumes = await ResumeModel
      .find({ user: user })
      .sort({ createdAt: -1 });
    success(res, { resumes }, "Your Previous History");
  } catch (err) {
    console.error(`[${req.requestId}] getAllResumesForUser error:`, err.message);
    next(err);
  }
};

exports.getResumeForAdmin = async (req, res, next) => {
  try {
    let resumes = await ResumeModel
      .find({})
      .sort({ createdAt: -1 })
      .populate('user');
    success(res, { resumes }, "Fetched All History");
  } catch (err) {
    console.error(`[${req.requestId}] getResumeForAdmin error:`, err.message);
    next(err);
  }
};

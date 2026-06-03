const ResumeModel = require('../Models/resume');
const pdfParseLib = require("pdf-parse");
const pdfParse = pdfParseLib.default || pdfParseLib;
const path = require("path");
const { CohereClientV2 } = require("cohere-ai");
const fs = require("fs");
const { success, error } = require('../utils/response');

let cohere = null;
if (process.env.COHERE_API_KEY) {
  cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });
}

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
        max_tokens: 600,
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

    if (!cohere) {
      return error(res, "COHERE_API_KEY is not configured on the server", 503);
    }

    const pdfPath = req.file.path;
    const dataBuffer = await fs.promises.readFile(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = truncateText(pdfData.text);

    const prompt = [
      'You are an expert ATS (Applicant Tracking System) screener and career coach.',
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
      'Return your analysis in this exact JSON format (no markdown, no code fences):',
      '{',
      '  "score": <number 0-100>,',
      '  "reason": "<2-3 sentence explanation focusing on key strengths and gaps>",',
      '  "skills": ["<skill1>", "<skill2>", ...],',
      '  "missing_skills": ["<missing_skill1>", ...],',
      '  "strengths": ["<strength1>", "<strength2>", ...],',
      '  "weaknesses": ["<weakness1>", "<weakness2>", ...],',
      '  "suggestions": ["<suggestion1>", "<suggestion2>", ...]',
      '}',
    ].join('\n');

    const response = await callCohereWithRetry(prompt);

    let raw = response.message.content[0].text;

    // Strip markdown code fences if present
    raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // fallback: extract score/reason from text format
      const scoreMatch = raw.match(/score["']?\s*:\s*(\d+)/i);
      const reasonMatch = raw.match(/reason["']?\s*:\s*"([^"]+)"/i);
      parsed = {
        score: scoreMatch ? scoreMatch[1] : null,
        reason: reasonMatch ? reasonMatch[1].trim() : raw.slice(0, 300),
        skills: [],
        missing_skills: [],
        strengths: [],
        weaknesses: [],
        suggestions: [],
      };
    }

    const newResume = new ResumeModel({
      user,
      resume_name: req.file.originalname,
      job_desc,
      score: String(parsed.score ?? ''),
      feedback: parsed.reason || '',
      skills: parsed.skills || [],
      missing_skills: parsed.missing_skills || [],
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      suggestions: parsed.suggestions || [],
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

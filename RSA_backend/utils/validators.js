const { body, param, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
}

const registerUser = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required (max 100 chars)'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('photoUrl').optional().trim().isURL().withMessage('photoUrl must be a valid URL'),
  handleValidation,
];

const addResume = [
  body('job_desc').trim().isLength({ min: 10, max: 10000 }).withMessage('Job description is required (10-10000 chars)'),
  body('user').trim().isMongoId().withMessage('Valid user ID is required'),
  handleValidation,
];

const getUserResumes = [
  param('user').trim().isMongoId().withMessage('Valid user ID is required'),
  handleValidation,
];

module.exports = { registerUser, addResume, getUserResumes };

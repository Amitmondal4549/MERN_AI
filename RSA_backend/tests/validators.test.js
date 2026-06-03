const validator = require('express-validator');

describe('validator schemas are properly defined', () => {
  it('registerUser exports an array of middleware', () => {
    const { registerUser } = require('../utils/validators');
    expect(Array.isArray(registerUser)).toBe(true);
    expect(registerUser.length).toBeGreaterThan(0);
  });

  it('addResume exports an array of middleware', () => {
    const { addResume } = require('../utils/validators');
    expect(Array.isArray(addResume)).toBe(true);
    expect(addResume.length).toBeGreaterThan(0);
  });

  it('getUserResumes exports an array of middleware', () => {
    const { getUserResumes } = require('../utils/validators');
    expect(Array.isArray(getUserResumes)).toBe(true);
    expect(getUserResumes.length).toBeGreaterThan(0);
  });
});

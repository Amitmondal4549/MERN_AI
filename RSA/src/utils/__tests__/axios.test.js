import { describe, it, expect, vi } from 'vitest';

vi.mock('../firebase', () => ({
  auth: {},
  provider: {},
}));

describe('Axios instance', () => {
  it('has a baseURL configured', async () => {
    const axios = (await import('../axios')).default;
    expect(axios.defaults.baseURL).toBeTruthy();
    expect(typeof axios.defaults.baseURL).toBe('string');
  });
});

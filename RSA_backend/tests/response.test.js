const httpMocks = require('node-mocks-http');
const { success, error, created, notFound, unauthorized, forbidden } = require('../utils/response');

function buildRes() {
  return httpMocks.createResponse();
}

describe('response utilities', () => {
  it('success sends 200 with message and data', () => {
    const res = buildRes();
    success(res, { user: { id: '1' } }, 'OK');
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.message).toBe('OK');
    expect(data.user.id).toBe('1');
  });

  it('created sends 201', () => {
    const res = buildRes();
    created(res, { id: '1' });
    expect(res.statusCode).toBe(201);
  });

  it('error sends 500 with message', () => {
    const res = buildRes();
    error(res, 'Server error');
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().error).toBe('Server error');
  });

  it('notFound sends 404', () => {
    const res = buildRes();
    notFound(res);
    expect(res.statusCode).toBe(404);
  });

  it('unauthorized sends 401', () => {
    const res = buildRes();
    unauthorized(res);
    expect(res.statusCode).toBe(401);
  });

  it('forbidden sends 403', () => {
    const res = buildRes();
    forbidden(res);
    expect(res.statusCode).toBe(403);
  });
});

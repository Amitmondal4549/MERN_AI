const admin = require('firebase-admin');

let firebaseApp = null;

try {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin initialized successfully");
  } else {
    console.log("Firebase Admin not configured — auth verification disabled");
  }
} catch (err) {
  console.error("Firebase Admin initialization failed:", err.message);
}

async function verifyIdToken(idToken) {
  if (!firebaseApp) return null;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded;
  } catch {
    return null;
  }
}

async function authMiddleware(req, res, next) {
  if (!firebaseApp) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await verifyIdToken(idToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.firebaseUser = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token verification failed' });
  }
}

function adminGuard(req, res, next) {
  if (!firebaseApp) return next();

  const allowedAdmins = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim());
  if (req.firebaseUser && allowedAdmins.includes(req.firebaseUser.email)) {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
}

module.exports = { authMiddleware, adminGuard, verifyIdToken };

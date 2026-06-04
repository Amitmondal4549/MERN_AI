const UserModel = require('../Models/user');
const ResumeModel = require('../Models/resume');
const { success, error } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const { name, email, photoUrl } = req.body;
    const userExist = await UserModel.findOne({ email: email });

    if (!userExist) {
      let newUser = new UserModel({ name, email, photoUrl });
      await newUser.save();
      console.log(`[${req.requestId}] New user registered:`, email);
      return success(res, { user: newUser }, "User Registered Successfully");
    }

    console.log(`[${req.requestId}] Existing user logged in:`, email);
    return success(res, { user: userExist }, "Welcome Back");
  } catch (err) {
    console.error(`[${req.requestId}] Register error:`, err.message);
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const email = req.firebaseUser?.email;
    if (!email) {
      return res.status(401).json({ error: 'No authenticated user email found' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    console.log(`[${req.requestId}] Session verified for:`, email);
    return success(res, { user }, "Session verified");
  } catch (err) {
    console.error(`[${req.requestId}] Get user error:`, err.message);
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalAnalyses, recentAnalyses] = await Promise.all([
      UserModel.countDocuments(),
      ResumeModel.countDocuments(),
      ResumeModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email'),
    ]);
    success(res, { totalUsers, totalAnalyses, recentAnalyses }, "Admin stats fetched");
  } catch (err) {
    console.error(`[${req.requestId}] getStats error:`, err.message);
    next(err);
  }
};

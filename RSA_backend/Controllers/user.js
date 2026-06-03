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
      return success(res, { user: newUser }, "User Registered Successfully");
    }

    return success(res, { user: userExist }, "Welcome Back");
  } catch (err) {
    console.error(`[${req.requestId}] Register error:`, err.message);
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

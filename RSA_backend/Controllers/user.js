const UserModel = require('../Models/user');
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
}

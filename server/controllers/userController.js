const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    const filter = { isActive: true };

    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter).select('name email role').sort({
      name: 1,
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers };

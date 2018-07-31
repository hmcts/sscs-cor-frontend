module.exports = (req, res, next) => {
  res.locals.asset_path = '/public/';

  next();
};

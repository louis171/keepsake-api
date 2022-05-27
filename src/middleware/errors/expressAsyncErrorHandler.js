expressAsyncErrorHandler = (err, req, res, next) => {
  if (err) {
    res.status(500).json(err);
  } else {
    next(err);
  }
};

module.exports = expressAsyncErrorHandler;
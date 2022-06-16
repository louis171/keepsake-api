// Catches jwt errors
const jwtErrorHandler = (err, res, next) => {
    if (err instanceof TokenExpiredError) {
      return res
        .status(401)
        .json({ message: "Unauthorized! Access Token is expired!" });
    } else if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Unauthorized! Malformed token!" });
    } else if (err instanceof NotBeforeError) {
      return res.status(401).json({ message: "Unauthorized! Token date error!" });
    } else {
      return res.status(401).json({ message: err });
    }
  };

  module.exports = jwtErrorHandler;
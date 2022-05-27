require("dotenv").config();

const jwt = require("jsonwebtoken");
const { TokenExpiredError, JsonWebTokenError, NotBeforeError } = jwt;

const authToken = async (req, res, next) => {
  if (req.cookies.keepsakeAccess) {
    // verifies access token from cookie
    jwt.verify(
      req.cookies.keepsakeAccess,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decrypt) => {
        if (err) {
          return catchErrorJwt(err, res);
        } else {
          // If valid then set userId on req.user
          req.user = {
            userId: decrypt.userId,
          };
          next();
        }
      }
    );
  } else {
    //
    res.status(401).json({ message: "Failed" });
  }
};

// Catches jwt errors
const catchErrorJwt = (err, res, next) => {
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

  module.exports = authToken;
require("dotenv").config();

const express = require("express");
const authRouter = express.Router();
const prismaClient = require("../../prisma/prismaClient");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const verifySignUp = require("../middleware/verifySignUp");

const { TokenExpiredError, JsonWebTokenError, NotBeforeError } = jwt;

// CREATE new user. Handles verification of unique email and encrypts password
authRouter.post(
  "/signup",
  verifySignUp.isValidEmail,
  verifySignUp.checkDuplicateEmail,
  async (req, res, next) => {
    const hashedPassword = await argon2.hash(req.body.userPassword);
    const userId = nanoid(16);
    await prismaClient.user
      .create({
        data: {
          userId: userId,
          userForename: req.body.userForename,
          userSurname: req.body.userSurname,
          userEmail: req.body.userEmail,
          userPassword: hashedPassword,
        },
      })
      .then((user) => {
        res.status(201).json({ message: "Creation Successfull", user: user });
      })
      .catch((err) => next(err))
      .finally(async () => {
        await prismaClient.$disconnect();
      });
  }
);

// Handles user signin and creation of cookies/jwt
authRouter.post("/signin", async (req, res, next) => {
  const expirationAccess = process.env.ACCESS_TOKEN_EXPIRE;

  await prismaClient.user
    .findFirst({
      where: {
        userEmail: req.body.userEmail,
      },
    })
    .then(async (user) => {
      if (!user) {
        // Send 404 user not found if email doesnt match anything in DB
        return res.status(404).json({ message: "No user found" });
      }

      // Compares submitted password against password in DB
      const isValidPassword = await argon2.verify(
        user.userPassword,
        req.body.userPassword
      );

      if (isValidPassword) {
        // Creates expiration time for cookies/JWT from .env variables
        const expirationDateTimeAccess = new Date(
          Date.now() + parseInt(expirationAccess)
        );

        // Creates access token. Contains userId. Valid for 1 hour
        const accessToken = await jwt.sign(
          {
            userId: user.userId,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1h" }
        );

        // Creates access token cookie
        res.cookie("keepsakeAccess", accessToken, {
          expires: expirationDateTimeAccess,
          secure: false,
          httpOnly: true,
          sameSite: true,
        });

        res.status(200).json({
          message: "Success",
          user: {
            userForename: user.userForename,
            userSurname: user.userSurname,
            userId: user.userId,
          },
        });
      } else {
        // Send 401 eror is password doesnt match DB
        res.status(401).json({ message: "Failed" });
      }
    })
    .catch((err) => next(err)) // Passes errors to error handling functions
    .finally(async () => await prismaClient.$disconnect()); // Disconnects from DB
});

module.exports = authRouter;

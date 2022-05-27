require("dotenv").config();

const express = require("express");
const userRouter = express.Router();
const prismaClient = require("../../prisma/prismaClient");
const authToken = require("../auth/authToken");

userRouter.get("/info", authToken, async (req, res, next) => {
  await prismaClient.user
    .findUnique({
      where: {
        userId: req.user.userId,
      },
      select: {
        userId: true,
        userForename: true,
        userSurname: true,
        userEmail: true,
        usersCreated: true,
        userIsAdmin: true,
      },
    })
    .then((user) => {
      res.status(200).json({ user });
    })
    .catch((err) => next(err));
});

module.exports = userRouter;

const express = require("express");
const deceasedRouter = express.Router();
const prismaClient = require("../../prisma/prismaClient");
const { nanoid } = require("nanoid");
const fs = require("fs");
const multerConfig = require("../config/multerConfig");
const authToken = require("../auth/authToken");

// CREATE deceased with image
deceasedRouter.post(
  "/add:deceasedUserId?",
  authToken,
  multerConfig.handleUpload,
  async (req, res, next) => {
    const deceasedId = nanoid(16);
    const url = req.protocol + "://" + req.get("host") + "/public";
    const path = url + "/" + req.file.path.split("\\")[1];
    await prismaClient.deceased
      .create({
        data: {
          deceasedUserId: req.query.deceasedUserId,
          deceasedId: deceasedId,
          deceasedForename: req.body.deceasedForename,
          deceasedMiddlename: req.body.deceasedMiddlename,
          deceasedSurname: req.body.deceasedSurname,
          deceasedDateOfBirth: new Date(req.body.deceasedDateOfBirth),
          deceasedDateOfDeath: new Date(req.body.deceasedDateOfDeath),
          deceasedDetails: req.body.deceasedDetails,
          deceasedimage: {
            create: {
              deceasedImageId: req.file.filename.split("!")[0],
              deceasedImagePath: path,
              deceasedImageName: req.file.originalname,
              deceasedImageSize: req.file.size.toString(),
              deceasedImageType: req.file.mimetype,
            },
          },
        },
      })
      .then((deceased) => {
        prismaClient.$disconnect;
        res.status(201).json(deceased);
      })
      .catch((err) => next(err));
  }
);

// READ all deceased from DB. Doesnt include deceasedUserId
deceasedRouter.get("/all", async (req, res, next) => {
  await prismaClient.deceased
    .findMany({
      select: {
        deceasedId: true,
        deceasedForename: true,
        deceasedMiddlename: true,
        deceasedSurname: true,
        deceasedDateOfBirth: true,
        deceasedDateOfDeath: true,
        deceasedDetails: true,
        deceasedUpdated: true,
        deceasedimage: {
          select: {
            deceasedImageId: true,
            deceasedImagePath: true,
            deceasedImageName: true,
          },
        },
      },
    })
    .then((deceased) => {
      prismaClient.$disconnect;
      res.status(200).json(deceased);
    })
    .catch((err) => next(err));
});

// READ deceased by deceasedId. Doesnt include deceasedUserId
deceasedRouter.get("/deceasedId:deceasedId?", async (req, res, next) => {
  await prismaClient.deceased
    .findMany({
      where: {
        deceasedId: req.query.deceasedId,
      },
      select: {
        deceasedId: true,
        deceasedForename: true,
        deceasedMiddlename: true,
        deceasedSurname: true,
        deceasedDateOfBirth: true,
        deceasedDateOfDeath: true,
        deceasedDetails: true,
        deceasedUpdated: true,
        deceasedimage: {
          select: {
            deceasedImageId: true,
            deceasedImagePath: true,
            deceasedImageName: true,
          },
        },
      },
    })
    .then((deceased) => {
      prismaClient.$disconnect;
      res.status(200).json(deceased);
    })
    .catch((err) => next(err));
});

// READ deceased by userId
deceasedRouter.get("/user:userId?", async (req, res, next) => {
  if (req.query.userId) {
    await prismaClient.deceased
      .findMany({
        where: {
          deceasedUserId: req.query.userId,
        },
        select: {
          deceasedId: true,
          deceasedUserId: true,
          deceasedForename: true,
          deceasedMiddlename: true,
          deceasedSurname: true,
          deceasedDateOfBirth: true,
          deceasedDateOfDeath: true,
          deceasedDetails: true,
          deceasedUpdated: true,
          deceasedCreated: true,
          deceasedimage: {
            select: {
              deceasedImageId: true,
              deceasedImagePath: true,
              deceasedImageName: true,
            },
          },
        },
      })
      .then((deceased) => {
        res.status(200).json(deceased);
      })
      .catch((err) => next(err));
  } else {
    res.status(400).json({ message: "Error. Invalid request" });
  }
});

deceasedRouter.get("/quantity:quantity?", async (req, res, next) => {
  await prismaClient.deceased
    .findMany({
      take: parseInt(req.query.quantity),
      orderBy: {
        deceasedUpdated: "desc",
      },
      select: {
        deceasedId: true,
        deceasedForename: true,
        deceasedMiddlename: true,
        deceasedSurname: true,
        deceasedDateOfBirth: true,
        deceasedDateOfDeath: true,
        deceasedDetails: true,
        deceasedUpdated: true,
        deceasedimage: {
          select: {
            deceasedImageId: true,
            deceasedImagePath: true,
            deceasedImageName: true,
          },
        },
      },
    })
    .then((deceased) => {
      res.status(200).json(deceased);
    })
    .catch((err) => next(err));
});

// UPDATE by deceasedId **ADD IMAGE**
deceasedRouter.put(
  "/update:deceasedId?",
  authToken,
  multerConfig.handleUpload,
  async (req, res, next) => {
    await prismaClient.deceased
      .update({
        where: {
          deceasedId: req.query.deceasedId,
        },
        data: {
          deceasedForename: req.body.deceasedForename,
          deceasedMiddlename: req.body.deceasedMiddlename,
          deceasedSurname: req.body.deceasedSurname,
          deceasedDateOfBirth: new Date(req.body.deceasedDateOfBirth),
          deceasedDateOfDeath: new Date(req.body.deceasedDateOfDeath),
          deceasedDetails: req.body.deceasedDetails,
          memoryimage: {
            data: {
              deceasedImageId: req.file.filename.split("!")[0],
              deceasedImagePath: path,
              deceasedImageName: req.file.originalname,
              deceasedImageSize: req.file.size.toString(),
              deceasedImageType: req.file.mimetype,
            },
          },
        },
      })
      .then((deceased) => {
        res.status(200).json({
          message: `Updated deceased with ID ${req.query.deceasedId}`,
          deceased: deceased,
        });
      })
      .catch((err) => next(err));
  }
);

deceasedRouter.delete(
  "/delete:deceasedId?",
  authToken,
  async (req, res, next) => {
    await prismaClient.deceasedimage
      .findFirst({
        where: {
          deceasedImageDeceasedId: req.query.deceasedId,
        },
      })
      .then((image) => {
        fs.unlink(
          `public/${image.deceasedImagePath.split("/").pop()}`,
          (err) => {
            if (err) next(err);
          }
        );
      })
      .catch((err) => next(err)); // passing error to middleware
    await prismaClient.deceased
      .delete({
        where: {
          deceasedId: req.query.deceasedId,
        },
      })
      .then(
        res
          .status(200)
          .json({ message: `Deleted with ID ${req.query.deceasedId}` })
      )
      .catch((err) => next(err)); // passing error to middleware
  }
);

module.exports = deceasedRouter;

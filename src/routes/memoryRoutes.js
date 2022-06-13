const express = require("express");
const memoryRouter = express.Router();
const prismaClient = require("../../prisma/prismaClient");
const { nanoid } = require("nanoid");
const fs = require("fs");
const multerConfig = require("../config/multerConfig");
const authToken = require("../auth/authToken");

// CREATE memory
memoryRouter.post(
  "/add:deceasedId?",
  authToken,
  multerConfig.handleUpload,
  async (req, res, next) => {
    const memoryId = nanoid(16);
    const url = req.protocol + "://" + req.get("host") + "/public";
    const path = url + "/" + req.file.path.split("\\")[1];
    await prismaClient.memory
      .create({
        data: {
          memoryDeceasedId: req.query.deceasedId,
          memoryId: memoryId,
          memoryForename: req.body.memoryForename,
          memorySurname: req.body.memorySurname,
          memoryBody: req.body.memoryBody,
          memoryimage: {
            create: {
              memoryimageId: req.file.filename.split("!")[0],
              memoryImagePath: path,
              memoryImageName: req.file.originalname,
              memoryImageSize: req.file.size.toString(),
              memoryImageType: req.file.mimetype,
            },
          },
        },
      })
      .then((memory) => {
        prismaClient.$disconnect;
        res.status(201).json(memory);
      })
      .catch((err) => next(err));
  }
);

// READ memories by deceasedId
memoryRouter.get("/:deceasedId?", async (req, res, next) => {
  await prismaClient.memory
    .findMany({
      where: {
        memoryDeceasedId: req.query.deceasedId,
      },
      select: {
        memoryId: true,
        memoryForename: true,
        memorySurname: true,
        memoryBody: true,
        memoryCreated: true,
        memoryUpdated: true,
        memoryimage: {
          select: {
            memoryImagePath: true,
            memoryImageName: true,
          },
        },
      },
    })
    .then((memories) => {
      prismaClient.$disconnect;
      res.status(200).json(memories);
    })
    .catch((err) => next(err));
});

// update memory by memoryId
memoryRouter.put(
  "/update:memoryId?",
  authToken,
  multerConfig.handleUpload,
  async (req, res, next) => {
    const url = req.protocol + "://" + req.get("host") + "/public";
    const path = url + "/" + req.file.path.split("\\")[1];
    await prismaClient.memory
      .update({
        where: {
          memoryId: req.query.memoryId,
        },
        data: {
          memoryForename: req.body.memoryForename,
          memorySurname: req.body.memorySurname,
          memoryBody: req.body.memoryBody,
          memoryimage: {
            update: {
              where: {
                memoryimageId: req.body.memoryimageId,
              },
              data: {
                memoryImagePath: path,
                memoryImageName: req.file.originalname,
                memoryImageSize: req.file.size.toString(),
                memoryImageType: req.file.mimetype,
              },
            },
          },
        },
      })
      .then((memory) => {
        prismaClient.$disconnect;
        res.status(200).json(memory);
      })
      .catch((err) => next(err));
  }
);

memoryRouter.delete("/delete:memoryId?", authToken, async (req, res, next) => {
  // Finds memoryImages using memoryId
  await prismaClient.memoryimage
    .findFirst({
      where: {
        memoryimageMemoryId: req.query.memoryId,
      },
    })
    .then((image) => {
      // Deletes images from public folder
      fs.unlink(`public/${image.memoryImagePath.split("/").pop()}`, (err) => {
        if (err) next(err);
      });
    })
    .catch((err) => next(err)); // passing error to middleware

    // Deletes memory from DB
  await prismaClient.memory
    .delete({
      where: {
        memoryId: req.query.memoryId,
      },
    })
    .then(
      res.status(200).json({ message: `Deleted with ID ${req.query.memoryId}` })
    )
    .catch((err) => next(err)); // passing error to middleware
});

module.exports = memoryRouter;

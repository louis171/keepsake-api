const Prisma = require("@prisma/client");
const prismaClient = require("../../../prisma/prismaClient");

// Checks for prisma related errors and handles accordingly
prismaErrorHandler = (err, req, res, next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
/*     logs.prismaLogStandard.write(
      prismaClient.$on("query", (e) => {
        console.log("Query: " + e.query);
        console.log("Params: " + e.params);
        console.log("Duration: " + e.duration + "ms");
      })
    ); */
    res
      .status(500)
      .json({ errorCode: err.code, meta: err.meta, message: err.message });
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    //logs.prismaLogStandard.write(`PrismaClientUnknownRequestError ${err.message}`);
    res.status(500).json({ message: err.message });
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    //logs.prismaLogStandard.write(`PrismaClientRustPanicError ${err.message}`);
    res.status(500).json({ message: err.message });
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    //logs.prismaLogStandard.write(`PrismaClientInitializationError ${err.message}`);
    res.status(500).json({ errorCode: err.errorCode, message: err.message });
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    //logs.prismaLogStandard.write(`PrismaClientValidationError ${err.message}`);
    res.status(500).json({ error: err.message });
  } else {
    next(err);
  }
};

module.exports = prismaErrorHandler;
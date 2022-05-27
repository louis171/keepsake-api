const prismaClient = require("../../prisma/prismaClient");

checkDuplicateEmail = async (req, res, next) => {
  // Email
  await prismaClient.user
    .findFirst({
      where: {
        userEmail: req.body.userEmail,
      },
    })
    .then((user) => {
      if (user) {
        res.status(400).send({
          message: "Failed! Email is already in use!",
        });
        return;
      }
      next();
    });
};

let validRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

isValidEmail = (req, res, next) => {
  const email = req.body.userEmail;
  if (!email) {
    res.status(400).send({
      message: "Failed! No email!",
    });
    return;
  }
  if (email == "") {
    res.status(400).send({
      message: "Failed! empty email!",
    });
    return;
  }
  if (email.length > 254) {
    res.status(400).send({
      message: "Failed! Email over 254 characters",
    });
    return;
  }
  const isValid = validRegex.test(email);
  if (!isValid) {
    res.status(400).send({ message: "Email format invalid" });
  }

  if (isValid) {
    next();
  }
};

const verifySignUp  = {
  checkDuplicateEmail: checkDuplicateEmail,
  isValidEmail: isValidEmail,
};

module.exports = verifySignUp;
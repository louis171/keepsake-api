const express = require("express");

const cors = require("cors");
const corsConfig = require("./config/corsConfig");

const cookieParser = require("cookie-parser")

const authRouter = require("./routes/authRoutes");
const deceasedRouter = require("./routes/deceasedRoutes");
const memoryRouter = require("./routes/memoryRoutes");
const userRouter = require("./routes/userRoutes");

const prismaErrorHandler = require("./middleware/errors/prismaErrorHandler");
const expressAsyncErrorHandler = require("./middleware/errors/expressAsyncErrorHandler");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsConfig));

app.use("/public", express.static("public"));

app.use("/auth", authRouter);
app.use("/deceased", deceasedRouter);
app.use("/memory", memoryRouter);
app.use("/user", userRouter);

// Error handling middleware
app.use(prismaErrorHandler);
app.use(expressAsyncErrorHandler);

// Starts the server on EITHER the port listed in .env or 4000
app.listen(process.env.PORT || "4000", () => {
  console.log(`Server is running on port: ${process.env.PORT || "4000"}`);
});

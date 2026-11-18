// Entry point: builds the Express app, mounts the routes and starts listening.
import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import groupRoutes from "./src/routes/groupRoutes.js";
import sessionRoutes from "./src/routes/sessionRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import {
  notFoundHandler,
  errorHandler,
} from "./src/middleware/errorMiddleware.js";
import { checkDatabaseConnection } from "./src/config/db.js";

const app = express();
const port = process.env.PORT || 5000;

// Allow the React app to call this API and read JSON bodies
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api", dashboardRoutes);

// These two must come last
app.use(notFoundHandler);
app.use(errorHandler);

await checkDatabaseConnection();
app.listen(port, () =>
  console.log(`The server is running on http://localhost:${port}`),
);

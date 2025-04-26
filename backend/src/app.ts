import express from "express";
import cors from "cors";
import availabilityRouter from "./routes/availability";
import bookingRouter from "./routes/booking";
import usersRouter from "./routes/users";

const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());

app.use("/users", usersRouter);
app.use("/availability", availabilityRouter);
app.use("/booking", bookingRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;

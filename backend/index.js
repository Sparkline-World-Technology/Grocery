import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.get("/", (req, res) => {
  res.send("Welcome to Grocery Management SYSTEM");
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

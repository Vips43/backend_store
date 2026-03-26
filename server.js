import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./conn.js";
import authRouter from "./models/authModel.js";
import productRoute from "./models/productModel.js";
import cartModel from "./models/cartModel.js";
import wishlistModel from "./models/wishlistModel.js";
import writeFileModel from "./models/write.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "./data/data.json");

const getLocalData = async () => {
  const rawData = await fs.readFile(filePath, "utf-8");
  return JSON.parse(rawData);
};

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB();

app.use("/auth", authRouter);
app.use("/v1", productRoute(getLocalData));
app.use("/v1", cartModel(getLocalData));
app.use("/v1", wishlistModel(getLocalData));
app.use("/api", writeFileModel());

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});

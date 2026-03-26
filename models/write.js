import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { isAdmin } from "./authModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../data/file.json");

const updateFile = async (input) => {
  let products = [];
  try {
    const data = await fs.readFile(filePath, "utf8");
    products = data ? JSON.parse(data) : [];
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  const prefix = input.id;

  const highestNum = products.reduce((max, p) => {
    if (p.id && p.id.startsWith(prefix)) {
      const numPart = p.id.slice(prefix.length);
      const num = parseInt(numPart) || 0;
      return num > max ? num : max;
    }
    return max;
  }, 0);

  const newId = `${prefix}${highestNum + 1}`;

  const newProds = {
    ...input,
    id: newId,
    img: "image/" + input.img,
  };

  products.push(newProds);
  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
  return newProds;
};

function writeFileModel() {
  const router = express.Router();
  router.post("/add-data", async (req, res) => {
    const inputs = req.body;
    if (!inputs) {
      return res.status(400).json({ msg: "products not available" });
    }
    try {
      const createdUser = await updateFile(inputs);
      res.status(200).json({ msg: "Success", user: createdUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Write failed" });
    }
  });
  router.get("/read-file", async (req, res) => {
    try {
      const data = await fs.readFile(filePath, "utf8");
      const json = data ? JSON.parse(data) : { user: [] };
      res.status(200).json(json);
    } catch (err) {
      console.error("error reading file: ", err);
      if (err.code === "ENOENT") {
        return res.status(200).json({ user: [] });
      }
      res.status(500).json({ error: "Error reading file" });
    }
  });

  router.put("/edit",isAdmin, async (req, res) => {
    const { id, data } = req.body;

    try {
      const fileData = await fs.readFile(filePath, "utf8");
      const items = JSON.parse(fileData);
      const index = items.filter((f) => f.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data };
        await fs.writeFile(filePath, JSON.stringify(items, null, 2));
        res.send({ msg: "Updated successfully", item: items[index] });
      } else {
        res.status(404).send("Items not found");
      }
    } catch (error) {
      console.error("Error in editing file:", error);
    }
  });

  router.delete("/remove/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const contents = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(contents);
      const filteredData = await data.filter((d) => d.id !== id);

      await fs.writeFile(filePath, JSON.stringify(filteredData, null, 2));

      res.status(200).json(filteredData);
    } catch (error) {
      console.error("Error in deleting ", error);
      res.status(500).json({ Err: "Error in deleting item", err: err });
    }
  });

  //return the router
  return router;
}

export default writeFileModel;

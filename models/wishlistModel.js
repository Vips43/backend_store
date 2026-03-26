import express from "express";
import { User } from "../conn.js";

function wishlistModel(getLocalData) {
  const router = express.Router();

  router.get("/wishlist/:userId", async (req, res) => {
    const { userId } = req.params;
    if (!userId) return res.status(404).json({ msg: "UserId required" });
    try {
      const user = await User.findById(userId).select("wishlist");
      if (!user) return res.status(404).json({ msg: "User not found!" });

      res.status(200).json(user.wishlist || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ msg: "Internal server error" });
    }
  });

  router.post("/add-to-wishlist/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;
    if (!userId) return res.status(404).json({ msg: "UserId required" });
    if (!productId) return res.status(404).json({ msg: "product id required" });
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: { productId } } },
        { new: true },
      );
      const alreadyExists = user.wishlist.some(
        (item) => String(item.productId) === String(productId),
      );
      if (alreadyExists) {
        return res.status(200).json(user.wishlist);
      }
      console.log("added to wishlist", productId);
      res.status(200).json(user.wishlist);
    } catch (error) {
      console.error("Error in adding item to wishlist: ", error);
      res.status(500).json({ msg: "Internal server error" });
    }
  });

  router.delete("/remove-wishlist/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;
    if (!userId) return res.status(404).json({ msg: "UserId required" });
    if (!productId) return res.status(404).json({ msg: "product id required" });
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: { productId: productId } } },
        { new: true },
      );
      if (!user) return res.status(404).json({ msg: "User not found" });
      console.log("item removed from wishlist", productId)
      res.status(200).json(user.wishlist);
    } catch (error) {
      console.error("Error in removing from wishlist:", error);
      res.status(500).json({ msg: "Internal server error" });
    }
  });
  return router;
}

export default wishlistModel;

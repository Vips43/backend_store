import express from "express";
import { User } from "../conn.js";

function cartModel() {
  const router = express.Router();

  // 1. Get Cart
  router.get("/cart/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId).select("-pass");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json(user.cart || []);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 2. Add to Cart (Simple +1)
  router.get("/add-to-cart/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;
    if (!userId) return res.status(401).json({ msg: "user id not provided" });
    if (!productId)
      return res.status(401).json({ msg: "product id not provided" });
    try {
      const user = await User.findOne({
        _id: userId,
        "cart.productId": productId,
      });
      let updatedUser;

      if (user) {
        updatedUser = await User.findOneAndUpdate(
          { _id: userId, "cart.productId": productId },
          { $inc: { "cart.$.quantity": 1 } },
          { new: true },
        );
      } else {
        updatedUser = await User.findByIdAndUpdate(
          userId,
          { $push: { cart: { productId, quantity: 1 } } },
          { new: true },
        );
      }
      res.status(200).json(updatedUser.cart);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 3. Update Cart (Handles Increase/Decrease/Remove)
  router.post("/update-cart", async (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId) return res.status(401).json({ message: "Not Signed-in" });

    try {
      const user = await User.findOne({
        _id: userId,
        "cart.productId": productId,
      });
      let updatedUser;

      if (user) {
        const currentItem = user.cart.find(
          (item) => item.productId.toString() === productId.toString(),
        );

        if (quantity < 0 && currentItem.quantity <= 1) {
          updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { cart: { productId: productId } } },
            { new: true },
          );
        } else {
          updatedUser = await User.findOneAndUpdate(
            { _id: userId, "cart.productId": productId },
            { $inc: { "cart.$.quantity": quantity } },
            { new: true },
          );
        }
      } else if (quantity > 0) {
        updatedUser = await User.findByIdAndUpdate(
          userId,
          { $push: { cart: { productId, quantity: 1 } } },
          { new: true },
        );
      }

      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });
      res.status(200).json(updatedUser.cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // remove item from cart with product id
  router.delete("/remove-cart/:userId/:productId/", async (req, res) => {
    const { userId, productId } = req.params;
    console.log(`[Remove-Cart] Looking for user: ${userId}, Product: ${productId}`);
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { cart: { productId: productId } } },
        { new: true },
      );
      if (!updatedUser) {
        console.log(`[Remove-Cart] User ${userId} does not exist in the DB.`);
        return res.status(404).json({ message: "User not found!. " });
      }
      res.status(200).json(updatedUser.cart);
    } catch (error) {
      console.error("Error removing from cart: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // empty the cart
  router.delete("/empty-cart/:userId", async (req, res) => {
    const { userId } = req.params;
    if (!userId) return res.status(404).json({ message: "UserId is required" });
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { cart: [] } },
        { new: true },
      );

      if (!updatedUser) return res.status(404).json({ msg: "User not found" });

      res
        .status(200)
        .json({ cart: updatedUser.cart, message: "Cart empty successfully" });
    } catch (error) {
      console.error("Error in empty cart: ", error);
      res.status(500).json({ error, msg: "Internal server error" });
    }
  });

  return router;
}

export default cartModel;

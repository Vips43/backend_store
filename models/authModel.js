import express from "express";
import { User } from "../conn.js";

const authRouter = express.Router();

export const isAdmin = async (req, res, next) => {
  const userId = req.headers["user-id"];
  if (!userId) {
    return res.status(401).json({ msg: "No user ID provided" });
  }
  try {
    const user = await User.findById(userId);

    if (user && user.role === "admin") {
      next();
    } else {
      res.status(403).json({ msg: "Access denied. Admins only." });
    }
  } catch (error) {
    res.status(500).json({ msg: "Database error" });
  }
};

authRouter.post("/signup", async (req, res) => {
  try {
    const { name, email, pass } = req.body;
    if (name && email && pass) {
      if (pass.length < 5) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 5 characters long",
        });
      }
    } else {
      return res.send({
        message: "all fields are required",
      });
    }

    const newUser = new User({ name, email, pass });
    await newUser.save();

    res.status(201).json({ success: true, message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(500)
      .json({ success: false, message: "Signup failed", error: err });
  }
});

authRouter.post("/login", async (req, res) => {
  console.log("LOGIN HIT:", req.body);

  try {
    const { email, pass } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email does nor exits",
      });
    }

    if (user.pass !== pass) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Login error: ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

authRouter.get("/users", isAdmin, async (req, res) => {
  try {
    let users = await User.find().select("-pass");
    if (!users) res.status(401).json({ msg: "Users not found" });
    const userObj =
      users &&
      users.map((user) => ({
        user: user.name,
        id: user.id,
        email: user.email,
        role: user.role,
      }));
    res.status(200).json(userObj);
  } catch (error) {
    console.error("Error in getting users: ", error);
    res.status(500).json({ msg: "Error in getting users", error: error });
  }
});

authRouter.delete("/remove-user", isAdmin, async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.send(401).json({ msg: "user not found" });

    res.status(200).json({ msg: "user deleted successfully." });
  } catch (error) {
    console.error("Error in getting users: ", error);
    res.status(500).json({ msg: "Error in getting users", error: error });
  }
});

export default authRouter;

import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import User from "../models/userSchema.js";
import jwt from "jsonwebtoken";

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      res.status(422).json({ error: "Email already exists" });
    } else {
      const userDetails = new User({ name, email, password });

      await userDetails.save();

      res.status(201).json({ message: "Registration Successful!" });
    }
  } catch (err) {
    console.log(err);
  }
});

// login route

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const loginDetails = await User.findOne({ email: email });

    if (loginDetails) {
      const isMatch = await bcrypt.compare(password, loginDetails.password);

      if (!isMatch) {
        res.status(400).json({ error: "Invalid Credentials" });
      } else {
        const token = jwt.sign(
          { name: loginDetails.name },
          process.env.SECRET_KEY,
          { expiresIn: "24h" }
        );

        res.cookie("token", token, { withCredentials: true, secure : true, httpOnly : false });

        res
          .status(200)
          .json({
            message: "Successfully Logged In",
            token: token,
            user: loginDetails._id,
          });
      }
    } else {
      res.status(400).json({ error: "Invalid Credentials" });
    }
  } catch (err) {
    console.log(err);
  }
});

export const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

router.get("/dashboard/:id", authenticate, async (req, res) => {
      const id = req.params.id;
      const user = await User.findById({_id:id})
      if(user){
      res.status(200).json({ message: "Welcome to Dashboard" });
      }
})

router.put("/reset_password/new_password", async (req, res) => {
  
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(400).json({ message: "User does not exists" });
    } else {
      try {
    const hash = await bcrypt.hash(password, 12);

    const auth = await User.findByIdAndUpdate(
      { _id: user.id },
      { $set: { password: hash } },
      { new: true }
    );
    if (auth) {
      res.status(201).json({ message: "Password updated successfully", success: true });
    }
   } catch (error) {
    console.error(error);
    }
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("Logged Out Successfully");
});

export default router;

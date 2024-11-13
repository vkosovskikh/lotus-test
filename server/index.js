const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URL = process.env.MONGO_URL;

const app = express();

app.use(bodyParser.json());

mongoose.connect(MONGO_URL);

const userSchema = new mongoose.Schema({
  login: { type: String, unique: true, required: true },
  role: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

app.get("/hello", (req, res) => {
  res.send("Hello from Express!");
});

app.post("/register", async (req, res) => {
  const { login, role } = req.body.data;

  try {
    const existingUser = await User.findOne({ login });

    if (role !== "user" && role !== "admin") {
      return res.status(400).json({ message: "Неверная роль" });
    }

    if (existingUser) {
      return res.status(409).json({ message: "Логин уже используется" });
    }

    const newUser = new User({ login, role });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, login: newUser.login, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "Токен не найден" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    res.json({
      user: {
        login: user.login,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(400).json({ message: "Недействительный токен" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URL = process.env.MONGO_URL;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());

mongoose.connect(MONGO_URL);

const userSchema = new mongoose.Schema({
  login: { type: String, unique: true, required: true },
  role: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

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

let auctionTimer;
let turnTimer;
let timeLeft = 0;
let turnTimeLeft = 0;
let currentPlayerIndex = 0;
let players = [];
let isAuctionStarted = false;

io.on("connection", (socket) => {
  socket.on("joinAuctionRoom", ({ token }) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      socket.join("auctionRoom");
      socket.emit("playersUpdate", players);
    } catch (e) {
      socket.emit("error", { message: "Неверный токен" });
    }
  });

  socket.on("joinAuction", ({ token }) => {
    if (!isAuctionStarted) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = {
          login: decoded.login,
          value: 0,
        };

        if (decoded.role !== "user") {
          return socket.emit("error", {
            message: "Только обычные пользователи могут участвовать",
          });
        }

        if (players.some((p) => p.login === user.login)) {
          return socket.emit("error", { message: "Вы уже присоединились" });
        }

        players.push(user);

        io.to("auctionRoom").emit("playersUpdate", players);
      } catch (error) {
        socket.emit("error", { message: "Неверный токен" });
      }
    } else {
      socket.emit("error", { message: "Аукцион уже начался" });
    }
  });

  socket.on("startAuction", ({ token }) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== "admin") {
        return socket.emit("error", {
          message: "Только администратор может начать торги",
        });
      }

      if (players.length === 0) {
        return socket.emit("error", {
          message: "Нет игроков",
        });
      }

      if (isAuctionStarted) {
        return socket.emit("error", {
          message: "Аукцион уже начался",
        });
      }

      timeLeft = 95; // 900 15min
      turnTimeLeft = 30; // 30sec
      currentPlayerIndex = 0;
      isAuctionStarted = true;

      auctionTimer = setInterval(() => {
        if (timeLeft-- <= 0) {
          endAuction();
        } else {
          io.to("auctionRoom").emit("auctionTick", { timeLeft });
        }
      }, 1000);

      turnTimer = setInterval(() => {
        if (turnTimeLeft-- <= 1) {
          nextTurn();
        } else {
          io.to("auctionRoom").emit("turnTick", {
            currentPlayer: currentPlayerIndex,
            turnTimeLeft,
          });
        }
      }, 1000);

      io.to("auctionRoom").emit("auctionStarted", {
        timeLeft,
        turnTimeLeft,
        currentPlayerIndex,
      });
    } catch (error) {
      socket.emit("error", { message: "Ошибка начала торгов" });
    }
  });

  socket.on("endAuction", ({ token }) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== "admin") {
        return socket.emit("error", {
          message: "Только администратор может завершить торги",
        });
      }

      endAuction();
    } catch (error) {
      socket.emit("error", { message: "Ошибка завершения торгов" });
    }
  });

  socket.on("updateValue", ({ token, value }) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      const player = players.find((p) => p.login === decoded.login);

      if (!player) {
        return socket.emit("error", {
          message: "Вы не учавствуете в торгах",
        });
      }

      player.value = value;

      io.to("auctionRoom").emit("playersUpdate", players);

      nextTurn();
    } catch (error) {
      socket.emit("error", { message: "Ошибка завершения торгов" });
    }
  });

  socket.on("disconnect", () => {
    // no op
  });

  function nextTurn() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    turnTimeLeft = 30;

    io.to("auctionRoom").emit("turnTick", {
      currentPlayer: currentPlayerIndex,
      turnTimeLeft,
    });
  }

  function endAuction() {
    clearInterval(auctionTimer);
    clearInterval(turnTimer);

    auctionTimer = null;
    turnTimer = null;
    isAuctionStarted = false;
    timeLeft = 0;
    turnTimeLeft = 0;

    let winner = "Никто";
    let maxValue = 0;

    players.forEach((p) => {
      if (p.value > maxValue) {
        winner = p.login;
        maxValue = p.value;
      }
    });

    players = [];

    io.to("auctionRoom").emit("auctionEnded", {
      winner,
    });

    io.to("auctionRoom").emit("playersUpdate", players);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

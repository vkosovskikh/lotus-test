import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAppSelector } from "../../store/store";
import {
  Button,
  FormControl,
  InputGroup,
  Spinner,
  Table,
} from "react-bootstrap";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

export default function TradePage() {
  const socket = useRef<Socket | null>(null);

  const auth = useAppSelector((state) => state.app.auth);

  const [joinedRoom, setJoinedRoom] = useState(false);
  const [players, setPlayers] = useState<
    Array<{ socketId: string; login: string; value: number }>
  >([]);
  const [currentPlayer, setCurrentPlayer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(0);
  const [isAuctionStarted, setIsAuctionStarted] = useState(false);
  const [yourValue, setYourValue] = useState("0");

  const joinAuction = () => {
    if (socket.current && auth) {
      socket.current.emit("joinAuction", { token: auth.token });
    }
  };

  const startAuction = () => {
    if (socket.current && auth) {
      socket.current.emit("startAuction", { token: auth.token });
    }
  };

  const endAuction = () => {
    if (socket.current && auth) {
      socket.current.emit("endAuction", { token: auth.token });
    }
  };

  const handleSaveValueClick = () => {
    const numberValue = Number(yourValue);

    if (Number.isNaN(numberValue)) {
      return alert("Введите корректное число");
    }

    if (socket.current && auth) {
      socket.current.emit("updateValue", {
        token: auth.token,
        value: numberValue,
      });
    }
  };

  useEffect(() => {
    socket.current = io();

    if (auth) {
      socket.current.emit("joinAuctionRoom", { token: auth.token });

      socket.current.on("joinedRoom", () => {
        setJoinedRoom(true);
      });

      socket.current.on("playersUpdate", (updatedPlayers) => {
        setPlayers(updatedPlayers);
      });

      socket.current.on("auctionTick", ({ timeLeft }) => {
        setTimeLeft(timeLeft);
      });

      socket.current.on("turnTick", ({ currentPlayer, turnTimeLeft }) => {
        setCurrentPlayer(currentPlayer);
        setTurnTimeLeft(turnTimeLeft);
      });

      socket.current.on(
        "auctionStarted",
        ({ timeLeft, turnTimeLeft, currentPlayerIndex }) => {
          setIsAuctionStarted(true);
          setTimeLeft(timeLeft);
          setTurnTimeLeft(turnTimeLeft);
          setCurrentPlayer(currentPlayerIndex);
        }
      );

      socket.current.on("auctionEnded", ({ winner }) => {
        setIsAuctionStarted(false);
        setTimeLeft(0);
        setTurnTimeLeft(0);
        setCurrentPlayer(null);
        setYourValue("0");
        alert(`Торги завершены, победитель: ${winner}`);
      });

      socket.current.on("error", (err) => {
        alert(err.message);
      });
    }

    return () => {
      setJoinedRoom(false);

      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [auth]);

  if (!auth) return null;

  if (!joinedRoom) {
    return <Spinner />;
  }

  return (
    <div>
      <h2 className="mb-4">Аукцион ({formatTime(timeLeft)})</h2>

      <Table striped bordered>
        <thead>
          <tr>
            <th>Условия</th>
            {players.map((player, idx) => (
              <th
                key={player.login}
                style={{ color: currentPlayer === idx ? "green" : undefined }}
              >
                {player.login}&nbsp;
                {currentPlayer === idx && (
                  <span>({formatTime(turnTimeLeft)})</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Цена (руб)</td>
            {players.map((player, idx) => (
              <td key={player.login}>
                {player.login === auth.login ? (
                  <InputGroup size="sm">
                    <FormControl
                      placeholder="0"
                      value={yourValue}
                      onChange={(e) => setYourValue(e.target.value)}
                      disabled={idx !== currentPlayer}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={handleSaveValueClick}
                      disabled={idx !== currentPlayer}
                    >
                      Сохранить
                    </Button>
                  </InputGroup>
                ) : (
                  <span>{player.value}</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </Table>

      {auth.role === "admin" && (
        <div>
          <Button onClick={startAuction}>Начать торги</Button>
          <Button className="ms-2" onClick={endAuction}>
            Завершить торги
          </Button>
        </div>
      )}

      {auth.role === "user" && (
        <Button onClick={joinAuction}>Присоединиться к торгам</Button>
      )}
    </div>
  );
}

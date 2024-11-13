import { FormEventHandler, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { registerAction } from "../../store/appSlice";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const dispatch = useAppDispatch();

  const { isRegisterPending } = useAppSelector((state) => state.app);

  const [login, setLogin] = useState("");
  const [role, setRole] = useState("user");
  const [token, setToken] = useState("");

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      const res = await dispatch(registerAction({ login, role })).unwrap();

      setToken(res.token);
    } catch (e) {
      if (typeof e === "object" && "status" in e! && e.status === 409) {
        alert("Логин уже существует");
      } else {
        alert("Ошибка сервера");
      }
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "400px" }}>
      <h2 style={{ textAlign: "center" }}>Регистрация</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formLogin">
          <Form.Label>Логин</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введите логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formRole">
          <Form.Label>Роль</Form.Label>
          <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Пользователь</option>
            <option value="admin">Администратор</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={isRegisterPending}>
          Получить ссылку
        </Button>
      </Form>

      {token && (
        <div className="mt-2">
          <strong>Ссылка для входа:</strong>{" "}
          <Link to={`/login/${token}`} style={{ wordBreak: "break-all" }}>
            http://{window.location.host}/login/{token}
          </Link>
        </div>
      )}
    </Container>
  );
}

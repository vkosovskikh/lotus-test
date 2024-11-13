import { FormEventHandler, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const [loginLink, setLoginLink] = useState("");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log(username, role);
    setLoginLink("bla");
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "400px" }}>
      <h2 style={{ textAlign: "center" }}>Регистрация</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Логин</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введите логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

        <Button variant="primary" type="submit">
          Получить ссылку
        </Button>
      </Form>

      {loginLink && (
        <div className="mt-2">
          <strong>Ссылка для входа:</strong>{" "}
          <a href={loginLink} target="_blank">
            {loginLink}
          </a>
        </div>
      )}
    </Container>
  );
}

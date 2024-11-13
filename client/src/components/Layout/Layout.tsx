import { PropsWithChildren } from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/store";

export default function Layout(props: PropsWithChildren) {
  const location = useLocation();

  const auth = useAppSelector((state) => state.app.auth);

  return (
    <>
      <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand>Lotus Demo</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link active={location.pathname === "/"} as={Link} to="/">
              Торги
            </Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            {auth ? (
              <div>
                {auth.login} ({auth.role})
              </div>
            ) : (
              <Link to="/register">
                <Button variant="secondary" size="sm">
                  Регистрация
                </Button>
              </Link>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">{props.children}</Container>
    </>
  );
}

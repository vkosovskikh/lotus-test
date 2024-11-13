import { PropsWithChildren } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

export default function Layout(props: PropsWithChildren) {
  const location = useLocation();

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
        </Container>
      </Navbar>

      <Container className="mt-4">{props.children}</Container>
    </>
  );
}

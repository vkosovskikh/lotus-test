import { PropsWithChildren } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";

export default function Layout(props: PropsWithChildren) {
  return (
    <>
      <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand>Lotus Demo</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link>Торги</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">{props.children}</Container>
    </>
  );
}

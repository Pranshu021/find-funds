import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import useFetchAddress from '../hooks/useFetchAddress';
import '../css/navigationBar.css'
// import NavDropdown from 'react-bootstrap/NavDropdown';

const NavigationBar = (props) => {

    const userAddress = useFetchAddress();
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container fluid>
            <Navbar.Brand href="#home">findFunds</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#link">Link</Nav.Link>
              </Nav>
            </Navbar.Collapse>
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                    Address: <b className="address">{userAddress}</b>
                 </Navbar.Text>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      );
}

export default NavigationBar;
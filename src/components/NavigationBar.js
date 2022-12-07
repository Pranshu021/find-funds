import { Link } from "react-router-dom";
import '../assets/css/navigationBar.css'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

const NavigationBar = (props) => {
	return (
		<Navbar bg="primary" variant="dark" >
			<Container>
				<Navbar.Brand href="/" className="nav-logo">findFunds</Navbar.Brand>
				<Navbar.Toggle />
				<Navbar.Collapse className="justify-content-end">
				<Navbar.Text className="navbar-text">
					Address: <span>{props.account}</span>
				</Navbar.Text>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	)
}

export default NavigationBar;


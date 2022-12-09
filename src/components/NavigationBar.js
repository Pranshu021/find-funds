import { Link } from "react-router-dom";
import '../assets/css/navigationBar.css'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useSelector } from "react-redux";

const NavigationBar = (props) => {
	const address = useSelector((state) => state.address.value)

	return (
		<Navbar bg="primary" variant="dark" >
			<Container>
				<Navbar.Brand href="/" className="nav-logo">findFunds</Navbar.Brand>
				<Navbar.Toggle />
				<Navbar.Collapse className="justify-content-end">
				<Navbar.Text className="navbar-text">
					Address: <span>{address}</span>
				</Navbar.Text>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	)
}

export default NavigationBar;


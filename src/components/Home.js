import '../assets/css/home.css';
import SearchComponent from './SearchComponent';
import { Container, Row, Col } from 'react-bootstrap';
import { useSelector } from "react-redux";


const Home = (props) => {
	const address = useSelector((state) => state.address.value)

    return (
        <Container className="home-container text-center">

            <Row className="homepage-heading">
                <Col xs lg="12">
                    <h1 className="neon-heading">Welcome to findFunds</h1>
                </Col>
            </Row>

            <Row className="homepage-address mt-3">
                <Col xs lg="12">
                    {/* <p className="address">Your Address : {props.account}</p> */}
                    <p className="address">Your Address : {address}</p>

                </Col>
            </Row>

            <Row className="findfunds-description mt-3">
                <Col xs lg="12" className="c1">
                    <div className="c1"><div className="type">A web3 based decentralized Crowdsourcing platform for Builders and Believers.</div></div>
                    <br></br>
                </Col>
                <Col className="findfunds-description-mobile">
                    <p>A web3 based decentralized Crowdsourcing platform for Builders and Believers.</p>
                </Col>
            </Row>

            
        
            <SearchComponent contractData={props.contractData} account={props.account}/>

            

        </Container>
        
    )
}

export default Home;

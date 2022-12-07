import '../assets/css/home.css';
import SearchComponent from './SearchComponent';
import { Container, Row, Col } from 'react-bootstrap';
import { useEffect } from 'react';

// import { useNavigate } from 'react-router-dom';


const Home = (props) => {
    // useEffect(() => {
    //     console.log(props.contractData);
    // }, [props.contractData])

    // console.log(props.contractData);


    return (
        <Container className="home-container text-center">

            <Row className="homepage-heading">
                <Col xs lg="12">
                    <h1 className="neon-heading">Welcome to findFunds</h1>
                </Col>
            </Row>

            <Row className="homepage-address mt-3">
                <Col xs lg="12">
                    <p className="address">Your Address : {props.account}</p>
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

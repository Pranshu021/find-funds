import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Container, Row, Alert } from 'react-bootstrap';
import '../assets/css/registerProject.css';
import { useState } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';


const RegisterProject = (props) => {

    const [loading, setloadingState] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const user_address = useSelector((state) => state.address.value)
    const navigate = useNavigate();

    const createProject = async(name, description, address, targetAmountinEther) => {
        try {
            await props.contractData.projectContract.methods.addProject(name, description, address.toString(), targetAmountinEther).send({from:user_address}).on("receipt", (receipt) => {
                setMessage("Your Project has been registered Successfully. Best of Luck!!\n Redirecting...")
                setInterval(() => {
                    navigate(`/project/${address}`);
                }, 2000)
            }).on("error", (error) => {
                setError("Transaction Failed :( Try again after sometime")
                console.error(error)
            });
        } catch {
            setInterval(() => {
                setloadingState(true)
            }, 10000)
        }    
    }


    const handleSubmit = (event) => {
        event.preventDefault();
        let name = document.getElementById("projectName").value;
        let description = document.getElementById("projectDescription").value;
        let address = document.getElementById("projectAddress").value;
        let targetAmount = document.getElementById("targetAmount").value;
        let targetAmountinEther = window.web3.utils.toWei(targetAmount, 'ether');

        createProject(name, description, address, targetAmountinEther);
        // props.createProjectfunction(name, description, address, targetAmountinEther);
    }

    return (
        <Container className="registerFormContainer d-flex justify-content-center pt-5">

            {loading ? <Row><Alert variant="warning">Loading ...</Alert></Row> : 

                <Form onSubmit={handleSubmit} className="registerProjectForm p-5">
                    <Form.Group className="mb-3 center-block" controlId="projectName">
                        <Form.Label>Project Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter Project Name"/>
                        <Form.Text className="text-muted">
                        Don't forget to give a catchy name to your project ;)
                        </Form.Text>
                    </Form.Group>
                    

                    <Form.Group className="mb-3" controlId="projectDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="textarea" placeholder="Describe your Project..."/>
                        <Form.Text className="text-muted">
                        Do mention your project's official repo or website. It creates a level of trust!
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="projectAddress">
                        <Form.Label>Address</Form.Label>
                        <Form.Control type="text" placeholder="Project Address. Example : 0xE7FE232ab8ee51de897d10dC41FA6C955BF6AC75" />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="targetAmount">
                        <Form.Label>Target Amount</Form.Label>
                        <Form.Control type="number" placeholder="Traget funding amount"/>
                    </Form.Group>


                    <Button variant="primary" type="submit" className="btn-block registerProjectSubmitButton">
                        Submit
                    </Button>

                    {message ? <Row className="mt-3"><Alert variant="success">{message}</Alert></Row> : <></>}
                    {error ? <Row className="mt-3"><Alert variant="danger">{error}</Alert></Row> : <></>}

                </Form>
            }
        </Container>
        
    )
}

export default RegisterProject;
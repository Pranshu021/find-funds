import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import '../assets/css/projectpage.css'
import { Modal, Form } from "react-bootstrap";
import Web3 from "web3";


const ProjectPage = (props) => {
    const urlparams = useParams();
    const projectAddress = urlparams.projectAddress;
    const [isLoading, setLoading] = useState(true);
    const [projectNotFoundError, setProjectNotFoundError] = useState(false);
    const [transactionFailError, setTransactionFailError] = useState(false);
    const [projectData, setProjectData] = useState({})
    const [contributed, setContributed] = useState(false)
    const [contributionInfo, setContributionInfo] = useState({
        contribution: 0,
        vote: false,
    })
    
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    const checkProjectExists = async() => {
        try {
            const projectData = await props.contractData.projectContract.methods.getProject(projectAddress).call()
            setLoading(false);
            setProjectNotFoundError(false);
            setProjectData(projectData);
            console.log(projectData);
        } catch(Error) {
            setLoading(false);
            setProjectNotFoundError(true)
            // console.log(Error)
        }
    }

    const checkContributionToProject = async() => {
        // console.log(projectAddress);
        const contribution = await props.contractData.projectContract.methods.getContribution(props.account, projectAddress).call();

        const votingInfo = await props.contractData.projectContract.methods.getVotingInfo(props.account, projectAddress).call();
        
        setContributed(true)
        if(Web3.utils.fromWei(contribution, 'ether') > 0) {
            setContributed(true)
            setContributionInfo({
                contribution: Web3.utils.fromWei(contribution, 'ether'),
                vote: votingInfo
            })
            // contributionElement = (
            // <Row className="projectPage-content-rows">
            //     <Col xs="12" lg="6" className="projectPage-labels">Your Contribution :  </Col>
            //     <Col xs="12" lg="6">{Web3.utils.fromWei(contribution, 'ether')} ETH</Col> 
            // </Row>
            // )

            // votingElement = (
            // <Row className="projectPage-content-rows">
            //     <Col xs="12" lg="6" className="projectPage-labels">Your Release Fund Vote :  </Col>
            //     <Col xs="12" lg="6">{votingInfo}</Col> 
            // </Row>
            // )
        }
    }

    const handleFunding = async() => {
        const fundingAmount = document.getElementById("fundingValue").value
        await props.contractData.projectContract.methods.contributeToProject(projectData.projectAddress).send({from: props.account, value: Web3.utils.toWei(fundingAmount)}).on('receipt', (receipt) => {
            setContributed(true)
            setContributionInfo({
                contribution: fundingAmount,
                vote: true
            })
        }).on('error', (error) => {
            setTransactionFailError(true)
        })

        handleClose();
    }

    const ModalComponent = (
    <Modal show={show}>
        <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Fund Amount in ETH</Form.Label>
                    <Form.Control step="0.1" type="number" placeholder="Amount in ETH" id="fundingValue"/>
                    <Form.Text className="text-muted">
                    Your small contribution might help someone's dream :)
                    </Form.Text>
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} >
                Close
            </Button>
            <Button variant="primary" onClick={handleFunding}>
                Fund It !
            </Button>
            {transactionFailError && <Alert variant="danger">Error! Transaction Failed</Alert>}
        </Modal.Footer>
    </Modal>
    )

    useEffect(() => {
        checkProjectExists();
        checkContributionToProject();
    }, [props])

 
    return (

        <Container className="projectPage-container p-4">
            <Row className="mt-3">
                <Col lg xs="12">
                    {
                        isLoading && 
                        <Row className="mt-3">
                            <Col lg xs="12">
                                <Alert variant="warning" className="warning-alert">Loading Project Data ...</Alert>
                            </Col>
                        </Row>
                    }

                    {
                        !isLoading && projectNotFoundError &&
                        <Row className="mt-3">
                            <Col lg xs="12">
                            <Alert variant="danger" className="danger-alert">Project Not Found!</Alert>
                            </Col>
                        </Row>
                    }
                </Col>
            </Row>
      

            <Row className="text-center project-heading">
                <h1 className="projectHeading">{projectData.name}</h1>
            </Row>

            <Row className="projectPage-content-rows text-center">
                <h3>{projectData.description}</h3>
            </Row>

            <Row className="projectPage-content-rows">
                <Col xs="12" sm="12" lg="6" className="projectPage-labels">Address : </Col>
                <Col xs="12" sm="12" lg="6">{projectData.projectAddress}</Col> 
            </Row>

            {/* <Row>
                <Col xs lg="6">Target : </Col>
                <Col xs lg="6">{projectData.projectAddress}</Col> 
            </Row> */}

            <Row className="projectPage-content-rows">
                <Col xs="12" lg="6" className="projectPage-labels">Total Number of Investors : </Col>
                <Col xs="12" lg="6">{projectData.totalInvestors}</Col> 
            </Row>

            <Row className="projectPage-content-rows">
                <Col xs="12" lg="6" className="projectPage-labels">Target Amount : </Col>
                <Col xs="12" lg="6">{projectData.target/1000000000000000000} ETH</Col> 
            </Row>

            <Row className="projectPage-content-rows">
                <Col xs="12" lg="6" className="projectPage-labels">Number of Investors : </Col>
                <Col xs="12" lg="6">{projectData.totalInvestors}</Col> 
            </Row>

            <Row className="projectPage-content-rows">
                <Col xs="12" lg="6" className="projectPage-labels">Fund Releasing Votes : </Col>
                <Col xs="12" lg="6">{projectData.votes}</Col> 
            </Row>

            <hr></hr>

            {contributed && 
            <>
            <Row className="projectPage-content-rows">
                <Col xs="12" lg="6" className="projectPage-labels">Your Contribution :  </Col>
                <Col xs="12" lg="6">{Web3.utils.fromWei(contributionInfo.contribution, 'ether')} ETH</Col> 
            </Row>

            <Row className="projectPage-content-rows">
                <Col xs="12" lg="6" className="projectPage-labels">Your Release Fund Vote :  </Col>
                <Col xs="12" lg="6">{contributionInfo.vote}</Col>
            </Row>
            </>

            }


            <Row className="buttons-row mt-3">
                <Button variant="outline-primary" onClick={handleShow} className="buttons">Fund Project</Button>
                {ModalComponent}
            </Row>

            <Row className="buttons-row mt-3">
                <Button variant="outline-warning" onClick={handleShow} className="buttons">Vote Project</Button>
                {ModalComponent}
            </Row>

            <Row className="buttons-row mt-3">
                <Button variant="outline-danger" onClick={handleShow} className="buttons">Fund Project</Button>
                {ModalComponent}
            </Row>

        </Container>
    )

   
}

export default ProjectPage;

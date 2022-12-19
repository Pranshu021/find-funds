import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import '../assets/css/projectpage.css'
import { Modal, Form } from "react-bootstrap";
import Web3 from "web3";
import { useSelector } from "react-redux";


const ProjectPage = (props) => {
    const urlparams = useParams();
    const projectAddress = urlparams.projectAddress;
    const [isLoading, setLoading] = useState(true);
    const [projectNotFoundError, setProjectNotFoundError] = useState(false);
    const [transactionFailError, setTransactionFailError] = useState("");
    const [transactionSuccessMessage, setTransactionSuccessMessage] = useState("")
    const [projectData, setProjectData] = useState({})
    const [contributionInfo, setContributionInfo] = useState({
        contribution: 0,
        vote: false,
    })
    
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const user_address = useSelector((state) => state.address.value)

    const handleFunding = async() => {
        const fundingAmount = document.getElementById("fundingValue").value
        await props.contractData.projectContract.methods.contributeToProject(projectData.projectAddress).send({from: user_address, value: Web3.utils.toWei(fundingAmount)}).on('receipt', (receipt) => {
            setContributionInfo({
                contribution: fundingAmount,
                vote: true
            })
            setTransactionSuccessMessage("Transaction Successful. Thanks for the funding :)")
        }).on('error', (error) => {
            setTransactionFailError(error)
        })

        handleClose();
    }

    const handleVoting = async() => {
        const currentVote = contributionInfo.vote;
        await props.contractData.projectContract.methods.toggleVote(projectData.projectAddress).send({from: user_address}) 
        .on('receipt', (receipt) => {
            setContributionInfo({
                ...contributionInfo, 
                vote: !currentVote})
            setTransactionSuccessMessage("Transaction Successful. Your vote has been changed")
        }).on('error', (error) => {
            setTransactionFailError(error)
        })
    }

    const handleRefunds = async() => {
        if(contributionInfo.contribution > 0) {
            await props.contractData.projectContract.methods.refundContribution(projectData.projectAddress).send({from: user_address}).on('receipt', (receipt) => {
                setContributionInfo({
                    contributionInfo: 0,
                    vote: false
                })
            setTransactionSuccessMessage("Transaction Successful. You have been successfully refunded.")
            }).on('error', (error) => {
                setTransactionFailError(error)
            })
        }
    }

    const handleReleaseFunds = async() => {
        await props.contractData.projectContract.methods.releaseFunds(projectData.projectAddress).send({from: user_address}).on('receipt', (receipt) => {
            setTransactionSuccessMessage("Transaction Successful. Use the funds for greater good!!")
        }).on('error', (error) => {
            setTransactionFailError(error)
        })
    }

    const handleRemoveProject = async() => {
        await props.contractData.projectContract.methods.removeProject(projectData.projectAddress).send({from:user_address}).on('receipt', (receipt) => {
            setTransactionSuccessMessage("Project has been removed...")
        }).on('error', (error) => {
            setTransactionFailError(error);
        })
    }


    useEffect(() => {
        const checkProjectExists = async() => {
            try {
                const projectData = await props.contractData.projectContract.methods.getProject(projectAddress).call()
                setLoading(false);
                setProjectNotFoundError(false);
                setProjectData(projectData);
            } catch(Error) {
                setLoading(false);
                setProjectNotFoundError(true)
            }
        }

        checkProjectExists();
    }, [projectAddress, props.contractData.projectContract.methods])



    useEffect(() => {
        const checkContributionToProject = async() => {
            try {
                setLoading(true);
                const contribution = await props.contractData.projectContract.methods.getContribution(user_address, projectAddress).call();
        
                const votingInfo = await props.contractData.projectContract.methods.getVotingInfo(user_address, projectAddress).call();
                setLoading(false);
                // setContributed(true)
                if(Web3.utils.fromWei(contribution, 'ether') > 0) {
                    // setContributed(true)
                    setContributionInfo({
                        contribution: Web3.utils.fromWei(contribution, 'ether'),
                        vote: votingInfo
                    })
                }
            } catch(Error) {
                setLoading(false);
            }
            
        }
        checkContributionToProject();
    }, [projectAddress, user_address, props.contractData.projectContract.methods])


    const ModalComponent = (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Fund It !!</Modal.Title>
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
                {transactionFailError && <Alert variant="danger">{transactionFailError}</Alert>}
            </Modal.Footer>
        </Modal>
        )
       
 
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

            {contributionInfo.contribution > 0 && 
            <>
            <Row className="projectPage-content-rows">
                <Col xs="12" lg="6" className="projectPage-labels">Your Contribution :  </Col>
                <Col xs="12" lg="6">{contributionInfo.contribution} ETH</Col> 
            </Row>

            <Row className="projectPage-content-rows">
                <Col xs="12" lg="6" className="projectPage-labels">Your Release Fund Vote :  </Col>
                <Col xs="12" lg="6">{contributionInfo.vote ? <span>True</span> : <span>False</span>}</Col>
            </Row>
            </>

            }


            <Row className="buttons-row mt-3">
                <Button variant="outline-primary" onClick={handleShow} className="buttons">Fund Project</Button>
                {ModalComponent}
            </Row>

            
            
            {contributionInfo.contribution > 0 ? 
            <><Row className="buttons-row mt-3">
                <Button variant="outline-danger" onClick={handleRefunds} className="buttons">Get Refund</Button>
                {ModalComponent}
            </Row> 
            <Row className="buttons-row mt-3">
                <Button variant="outline-warning" onClick={handleVoting} className="buttons">{contributionInfo.vote ? <span>Vote to hold funds</span> : <span>Vote to Release Funds</span>}</Button>
                {ModalComponent}
            </Row></>: <></>}

            {projectData.owner === user_address ? 
            <Row className="buttons-row mt-3">
                <Button variant="outline-warning" onClick={handleReleaseFunds} className="buttons">Release Funds</Button>
                {ModalComponent}
            </Row> : <></>}

            
            {transactionSuccessMessage}
            {transactionFailError}
            {projectData.owner === user_address ? 
            <Row className="buttons-row mt-3">
                <Button variant="outline-primary" onClick={handleRemoveProject} className="buttons">Remove Project</Button>
            </Row>: <></> }

        </Container>
    )

   
}

export default ProjectPage;

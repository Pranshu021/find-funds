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
    const [isLoading, setLoading] = useState(false);
    const [projectNotFoundError, setProjectNotFoundError] = useState(false);
    const [transactionFailError, setTransactionFailError] = useState("");
    const [transactionSuccessMessage, setTransactionSuccessMessage] = useState("")
    const [projectData, setProjectData] = useState({})
    const [contributionInfo, setContributionInfo] = useState({
        contribution: 0,
        vote: false,
    })
    const [fundingAmount, setFundingAmount] = useState(0);
    
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const user_address = useSelector((state) => state.address.value)

    const handleFunding = async() => {
        setTransactionFailError("");
        setTransactionSuccessMessage("");

        await props.contractData.projectContract.methods.contributeToProject(projectData.projectAddress).send({from: user_address, value: Web3.utils.toWei(fundingAmount)})
        .on('receipt', (receipt) => {
            setContributionInfo({
                contribution: Number(contributionInfo.contribution) + Number(fundingAmount),
                vote: true
            })
            setTransactionSuccessMessage("Transaction Successful. Thanks for the funding :)")
        }).on('error', (error) => {
            setTransactionFailError(error.message)
        })

        handleClose();
    }

    const handleVoting = async() => {
        setTransactionFailError("");
        setTransactionSuccessMessage("");
        const currentVote = contributionInfo.vote;
        await props.contractData.projectContract.methods.toggleVote(projectData.projectAddress).send({from: user_address}) 
        .on('receipt', (receipt) => {
            setContributionInfo({
                ...contributionInfo, 
                vote: !currentVote})
            setTransactionSuccessMessage("Transaction Successful. Your vote has been changed")
        }).on('error', (error) => {
            setTransactionFailError(error.message)
        })
    }

    const handleRefunds = async() => {
        setTransactionFailError("");
        setTransactionSuccessMessage("");
        if(contributionInfo.contribution > 0) {
            await props.contractData.projectContract.methods.refundContribution(projectData.projectAddress).send({from: user_address}).on('receipt', (receipt) => {
                setContributionInfo({
                    contributionInfo: 0,
                    vote: false
                })
            setTransactionSuccessMessage("Transaction Successful. You have been successfully refunded.")
            }).on('error', (error) => {
                setTransactionFailError(error.message)
            })
        }
    }

    const handleReleaseFunds = async() => {
        await props.contractData.projectContract.methods.releaseFunds(projectData.projectAddress).send({from: user_address}).on('receipt', (receipt) => {
            setTransactionSuccessMessage("Transaction Successful. Use the funds for greater good!!")
        }).on('error', (error) => {
            setTransactionFailError(error.message)
        })
    }

    const handleRemoveProject = async() => {
        await props.contractData.projectContract.methods.removeProject(projectData.projectAddress).send({from:user_address}).on('receipt', (receipt) => {
            setTransactionSuccessMessage("Project has been removed...")
        }).on('error', (error) => {
            setTransactionFailError(error.message);
        })
    }

    const checkProjectExists = async() => {
        try {
            setTransactionFailError("");
            setTransactionSuccessMessage("");
            setLoading(true);
            await props.contractData.projectContract.methods.getProject(projectAddress).call().then((projectData) => {
                setProjectData(projectData);
                setProjectNotFoundError(false);
                console.log(user_address + "...." + projectData.owner)
            })
            checkContributionToProject();
            
        } catch(Error) {
            console.log(Error)
            setLoading(false);
            setProjectNotFoundError(true);
        }
    }

    const checkContributionToProject = async() => {
        try {
            await props.contractData.projectContract.methods.contributionInfo(user_address, projectAddress).call()
            .then(async(contributionData) => {
                if(contributionData) {
                    const votingInfo = await props.contractData.projectContract.methods.getVotingInfo(user_address, projectAddress).call();
                    const contributionAmount = await props.contractData.projectContract.methods.getContribution(user_address, projectAddress).call();
                    setLoading(false);
                    if(Web3.utils.fromWei(String(contributionAmount), 'ether')) {
                        setContributionInfo({
                            contribution: Web3.utils.fromWei(String(contributionAmount), 'ether'),
                            vote: votingInfo
                        })
                    }
                    setLoading(false);
                } else {
                    setLoading(false);
                    setContributionInfo({
                        contribution: 0,
                        vote: false
                    })
                }
            })
        } catch(Error) {
            console.log(Error)
            setLoading(false);
        }   
    }
    useEffect(() => {
        checkProjectExists();
    }, [projectAddress, props.contractData.projectContract.methods, user_address])

    


    const ModalComponent = (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Fund It !!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="fundingValue">
                        <Form.Label>Fund Amount in ETH</Form.Label>
                        <Form.Control step="0.1" type="number" placeholder="Amount in ETH" onChange={(e) =>
                        setFundingAmount(e.target.value)} value={fundingAmount}/>
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
            

            
            {transactionSuccessMessage ? <Alert variant="success" className="mt-3 text-center">{transactionSuccessMessage} </Alert>: <></> }

            {transactionFailError ? <Alert variant="danger" className="mt-3 text-center">{transactionFailError} [Tranasction Failed] </Alert>: <></> }

            {/* {!projectNotFoundError && !isLoading && ((projectData.owner).toLowerCase() === user_address.toLowerCase()) ? 
            <>
            <Row className="buttons-row mt-3">
                <Button variant="outline-warning" onClick={handleReleaseFunds} className="buttons">Release Funds</Button>
                {ModalComponent}
            </Row>
            <Row className="buttons-row mt-3">
                <Button variant="outline-danger" onClick={handleRemoveProject} className="buttons">Remove Project</Button>
            </Row></>: <></> } */}

            {projectData.owner} <br></br>
            {user_address}

        </Container>


    )

   
}

export default ProjectPage;

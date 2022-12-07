import '../assets/css/searchbar.css';
import { Row, Col, Button  } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import ProjectPage from './ProjectPage';


const SearchComponent = (props) => {

    const [projectAddress, setProjectAddress] = useState('')
    const [transactionError, setTransactionError] = useState(<></>)
    
    // const [project, currentProject] = useState('')
    const navigate = useNavigate();

    const inputChangeHandler = (event) => {
        const searchValue = event.target.value
        setProjectAddress(searchValue)
    }

    const onProjectSearchHandler = async(event) => {
        event.preventDefault();
        const project = projectAddress;

        // const totalNumberofProjects = await props.contractData.projectContract.methods.getTotalNumberofProjects().call()

        try {
            await props.contractData.projectContract.methods.getProject(project).call()
            navigate("/project/" + projectAddress)
            
        } catch (error) {
            setTransactionError(
                <Row className="error-row">
                    <Col lg="3"></Col>
                    <Col lg="6">
                        <Alert variant='danger' className="text-center">Error! No Project found with specified address</Alert>
                    </Col>
                    <Col lg="3"></Col>

                </Row>)
        }
    }

    return (
        <form className="project-searchform" onSubmit={onProjectSearchHandler}>
            <Row className="project-searchbar mt-3">
                <Col xs lg="12">
                    <input type="search" name="project-search" id="project-search" className="project-search" placeholder='Search for any project (Address) ...' onChange={(e)=>inputChangeHandler(e)} value={projectAddress}/>
                </Col>
            </Row>

            
            
            <Row className="mt-4 mb-4">
                <Col>
                    {/* <Button className="search-button" onClick={() => searchProjectHandler()}> */}
                    <Button className="search-button" type="submit">

                        Search
                    </Button>
                </Col>
            </Row>
            {transactionError}

        </form>

    )
}

export default SearchComponent;
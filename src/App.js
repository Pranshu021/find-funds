import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './components/Home';
import NavigationBar from './components/NavigationBar';
import Web3 from 'web3';
import Project from 'contracts/Project.sol/Project.json';
import Funds from 'contracts/Funds.sol/Funds.json';
import ParticlesBackground from './components/ParticlesBackground';
import RegisterProject from './components/RegisterProject';
import ProjectPage from './components/ProjectPage';
import { Container } from 'react-bootstrap';


function App() {
    const ethereum = window.ethereum;
    const [accountDetails, setAccountDetails] = useState("")
    const [data, setData] = useState({
        projectContract: {},
        projectContractAddress: '',
        fundsContract: {},
        fundsContractAddress: '',
        loading: true
    });

    if(window.ethereum) {
        window.web3 = new Web3(window.ethereum);
       
    } else if(window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        window.alert("No Web3 Provider installed in Browser. Please install Metamask");
    }

    const loadData = async() => {
        const ethereum = window.ethereum;
        await ethereum.request({method: "eth_requestAccounts"})
        .then((accounts) => {
            setAccountDetails(accounts[0]);
        }).catch((error) => {
            if (error.code === 4001) {
                console.log("Please connect to Metamask")
            } else {
                console.error(error)
            }
        })   
    }
    const handleAccountsChanged = (accounts) => {
        setAccountDetails(accounts[0]);
    }
    ethereum.on('accountsChanged', handleAccountsChanged)

    const loadContracts = async() => {
        const web3 = window.web3;
        const projectContractData = await new web3.eth.Contract(Project.abi, '0x4666c07Be2f0CfdD09AC2780E4fd22E9602D202C')
        const fundsContractData = await new web3.eth.Contract(Funds.abi, '0xe2C28703E97fb0EAcD496945B19Df7d652896758')

        setData({
            projectContract: projectContractData,
            projectContractAddress: '0x4666c07Be2f0CfdD09AC2780E4fd22E9602D202C',
            fundsContract: fundsContractData,
            fundsContractAddress: '0xe2C28703E97fb0EAcD496945B19Df7d652896758',
        })

    }

    const createProject = async(name, description, address, targetAmountinEther) => {
        const projectRegistrationStatus = await data.projectContract.methods.addProject(name, description, address.toString(), targetAmountinEther).send({from:accountDetails.toString()});
        console.log(projectRegistrationStatus);
    }

    const searchProject = async(address) => {
        const result = await Project.getProject(address)
        console.log(result);
    }

    useEffect(() => {
        // loadWeb3();
        loadContracts();
        loadData();
    }, [])

    return (
        <Router>
            <Container fluid className="App gx-0">
                <ParticlesBackground />
                <NavigationBar account={accountDetails}/>
                <Routes>
                    <Route exact path="/" element={<Home account={accountDetails} contractData={data}/>} />

                    <Route path="/createProject" element={<RegisterProject createProjectfunction={createProject}/>} />
                    <Route path="/project/:projectAddress" element={<ProjectPage contractData={data} account={accountDetails}/>} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;



// Figure out how to send msg.value to send eth for funding to a project in web3.js --- Done
// Make project contract functions public from external since they are not callable.
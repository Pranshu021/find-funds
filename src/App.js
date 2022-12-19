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
import { useDispatch } from 'react-redux';
import { changeAddress } from './features/address/addressSlice'


function App() {
    const ethereum = window.ethereum;
    const [data, setData] = useState({
        projectContract: {},
        projectContractAddress: '',
        fundsContract: {},
        fundsContractAddress: '',
        loading: true
    });

    const dispatch = useDispatch();

    if(window.ethereum) {
        window.web3 = new Web3(window.ethereum);
       
    } else if(window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        window.alert("No Web3 Provider installed in Browser. Please install Metamask");
    }

    const loadData = async() => {
        console.log("Loading data")
        const ethereum = window.ethereum;
        await ethereum.request({method: "eth_requestAccounts"})
        .then((accounts) => {
            dispatch(changeAddress(accounts[0]))
        }).catch((error) => {
            if (error.code === 4001) {
                console.log("Please connect to Metamask")
            } else {
                console.error(error)
            }
        })   
    }

    const handleAccountsChanged = (accounts) => {
        dispatch(changeAddress(accounts[0]))
    }
    ethereum.on('accountsChanged', handleAccountsChanged)

    const loadContracts = async() => {
        const web3 = window.web3;
        const projectContractData = await new web3.eth.Contract(Project.abi, '0x06Dc82dbaeE2f91875d9D705920fC6fccf788C28')
        const fundsContractData = await new web3.eth.Contract(Funds.abi, '0x7c2bb6809C6A829De4cDc0348E46E56D7eC645f5')

        console.log(projectContractData.methods)

        setData({
            projectContract: projectContractData,
            projectContractAddress: '0x06Dc82dbaeE2f91875d9D705920fC6fccf788C28',
            fundsContract: fundsContractData,
            fundsContractAddress: '0x7c2bb6809C6A829De4cDc0348E46E56D7eC645f5',
        })

    }

    // const createProject = async(name, description, address, targetAmountinEther) => {
    //     const projectRegistrationStatus = await data.projectContract.methods.addProject(name, description, address.toString(), targetAmountinEther).send({from:address});
    //     console.log(projectRegistrationStatus);
    // }

    useEffect(() => {
        // loadWeb3();
        loadContracts();
        loadData();
    }, [])

    return (
        <Router>
            <Container fluid className="App gx-0">
                <ParticlesBackground />
                {/* <NavigationBar account={accountDetails}/> */}
                <NavigationBar/>

                <Routes>
                    <Route exact path="/" element={<Home contractData={data}/>} />
                    <Route path="/createProject"/>
                    <Route path="/project/:projectAddress" element={<ProjectPage contractData={data}/>} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;



// Figure out how to send msg.value to send eth for funding to a project in web3.js --- Done
// Make project contract functions public from external since they are not callable.
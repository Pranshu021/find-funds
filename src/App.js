import './App.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './components/Home';
import NavigationBar from './components/NavigationBar';
// import { ethers } from "ethers";


function App() {
    return (
        <Router>
        <div className="App">
            <NavigationBar />
            <Routes>
            <Route exact path="/" element={<Home/>} />
            </Routes>
        </div>
        </Router>
    );
}

export default App;

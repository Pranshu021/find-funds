const ethereum = window.ethereum
let address = ''

const getAddress = async() => {
    await ethereum.request({method: 'eth_requestAccounts'}).then((accounts)=>{
        address = accounts[0];
    }).catch((error) => {
        if(error.code === 4001) {
            console.log("Please connect to Metamask")
        } else {
            console.error(error)
        }
    })
}

const addressReducer = (state = address, action) => {
    switch(action.type) {
        case 'CHANGEADDRESS':
            getAddress();
            state = action.payload;
            return state;
        default:
            return state;
    }
}

export default addressReducer
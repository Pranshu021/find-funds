const RegisterProject = (props) => {
    return (
        <form className="project-submission-form" id="project-submission-form" onSubmit={(event) => {
            event.preventDefault();
            let name = document.getElementById("projectName").value;
            let description = document.getElementById("projectDescription").value;
            let address = document.getElementById("projectAddress").value;
            let targetAmount = document.getElementById("targetAmount").value;
            let targetAmountinEther = window.web3.utils.toWei(targetAmount, 'ether');

            props.createProjectfunction(name, description, address, targetAmountinEther);

        }}>
            <label htmlFor="projectName">Project Name : </label>
            <input type="text" placeholder='name of the project' className="projectName" id="projectName"/> 
            
            <label htmlFor="projectDescription">Describe your Project : </label>
            <input type="text" placeholder='Description' className="projectDescription" id="projectDescription"/>

            <label htmlFor="projectAddress">Address of Project : </label>
            <input type="text" placeholder='Project address' className="projectAddress" id="projectAddress"/>\

            <label htmlFor="targetAmount">Target Amount (In Eth) : </label>
            <input type="number" placeholder='Target amount' className="targetAmount" id="targetAmount"/>

            <input type="submit" value="Create Project"/>
        </form>
    )
}

export default RegisterProject;
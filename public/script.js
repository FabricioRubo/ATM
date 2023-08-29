const billsAndCoinsModel = {
    'bill_100': 0,
    'bill_50': 0,
    'bill_20': 0,
    'bill_10': 0,
    'bill_5': 0,
    'bill_2': 0,
    'bill_1': 0,
    'coin_.50': 0,
    'coin_.25': 0,
    'coin_.10': 0,
    'coin_.05': 0,
    'coin_.01': 0,
}

// const loadAPIpage = () => {
//     const appDiv = document.getElementById('app');
//     appDiv.textContent = 'This is the API page content.';
// }
// document.getElementById('API').addEventListener('click', loadAPIpage);
  
const loadWithdrawInput = () => {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = `
        <div>
            <h2>Withdraw Page</h2>
            <h4>Insert the amount to withdraw</h4>
            <input type="number" id="withdrawAmount" min="1" required>
            <button onClick="submitWithdraw()">Withdraw</button>
        </div>
        <div id="result"></div>`;
}
document.getElementById('Withdraw').addEventListener('click', loadWithdrawInput);

const submitWithdraw = () => {
    const withdrawAmount = document.getElementById('withdrawAmount').value;
    if(Number(withdrawAmount)>0){
        if(withdrawAmount !== '' && !isNaN(withdrawAmount)) {
            const XMLrequest = new XMLHttpRequest();
    
            XMLrequest.open('GET', '/withdraw?money=' + withdrawAmount, true);
            XMLrequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        
            XMLrequest.onload = () => {
                if (XMLrequest.status === 200) {
                    const response = JSON.parse(XMLrequest.responseText);
                    const resultDiv = document.getElementById('result');
                    let html ='<h3>Completed! You withdrew the following bills and coins:</h3>'
                    for (const key in response) {
                        if (response.hasOwnProperty(key) && response[key]!=0) {
                            let messageOfItemWithdrawn = ''
                            const listOfAvailable = key.split('_') 
                            listOfAvailable[0] == 'bill' ? messageOfItemWithdrawn=listOfAvailable[1]+"$ bills" 
                            : messageOfItemWithdrawn=listOfAvailable[1]+"c coins"
                            html += `<li><b>${messageOfItemWithdrawn}</b>: ${response[key]}</li>`;
                        }
                    }
                    resultDiv.innerHTML = html
    
                } else if (XMLrequest.status === 409) {
                    const response = JSON.parse(XMLrequest.responseText);
                    let html = ``;
                    if (response.hasOwnProperty('billsAndCoins')) {
                        html = `<h3 class="alertMessage">${response.error}:</h3><h4>Please check if the bills and coins below are enough for this amount</h4><ul>`;
                        for (const key in response.billsAndCoins) {
                            if (response.billsAndCoins.hasOwnProperty(key) && response.billsAndCoins[key]!=0) {
                                let messageOfItemAvailability = ''
                                const listOfAvailable = key.split('_') 
                                listOfAvailable[0] == 'bill' ? messageOfItemAvailability=listOfAvailable[1]+"$ bills" 
                                : messageOfItemAvailability=listOfAvailable[1]+"c coins"
                                html += `<li><b>${messageOfItemAvailability}</b>: ${response.billsAndCoins[key]}</li>`;
                            }
                        }
                    } else {
                        html = `<h3 class="alertMessage">${response.error}:</h3>`;
                    }
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = html
    
                } else if (XMLrequest.status === 500) {
                    const response = JSON.parse(XMLrequest.responseText);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<h3 class="alertMessage">An internal error occured while processing your request</h3>`
                } else if (XMLrequest.status === 403) {
                    const response = JSON.parse(XMLrequest.responseText);
                    html = `<h3 class="alertMessage">${response.error}:</h3>`;
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = html
                }
            };
            XMLrequest.send();
        } else {
            alert('You must insert a valid number in the input field')
            document.getElementById('withdrawAmount').value = ''
        }
    } else {
        alert('You must insert a valid and positive number in the input field')
        document.getElementById('withdrawAmount').value = ''
    }
    
}

const loadMaintenanceInput = () => {
    const XMLrequest = new XMLHttpRequest();
    

    XMLrequest.open('GET', '/moneyAvailable', true);
    XMLrequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    XMLrequest.onload = () => {
        if (XMLrequest.status === 200) {
            const response = JSON.parse(XMLrequest.responseText);
            let htmlCurrentBillsAndCoins = ''
            let htmlSupplyBillsAndCoinsInput = ''
            for (const key in response.billsAndCoins) {
                let messageOfItemAvailability = ''
                const listOfAvailable = key.split('_') 
                listOfAvailable[0] == 'bill' ? 
                    messageOfItemAvailability=listOfAvailable[1]+"$ bills" 
                    : 
                    messageOfItemAvailability=listOfAvailable[1]+"c coins"
                htmlCurrentBillsAndCoins += `<tr><td><b>${messageOfItemAvailability}</b></td><td>${response.billsAndCoins[key]}</td></tr>`;
                htmlSupplyBillsAndCoinsInput += `<div class='maintenanceSupplyInput'><div class="itemDescriptionTable">${messageOfItemAvailability}</div><input class='inputMaintenance' id='inputMaintenanceField' min='0' step="1" value='0' type='number'/></div>`
            }
            const appDiv = document.getElementById('app');
            const hmtlMaintenacePage = `
                <h2>Maintenance Page</h2>
                <h4>Amount available: ${response.moneyAvailable}</h4>
                <div id="maintenanceSupplyResult"></div>
                <div class='maintenanceContainer'>
                    <div class='maintenanceInputContainer'>
                        <h3>Fill below to supply the machine</h3>
                        <div class='maintenanceFormContainer'>
                            ${htmlSupplyBillsAndCoinsInput}
                        </div>
                    </div>
                    <div class='maintenanceTableContainer'>
                        <h3>Total of bills and coins available</h3>
                        <table id='tableCoinsAndBills'>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                            </tr>
                            ${htmlCurrentBillsAndCoins}
                        </table>
                    </div>
                    
                </div>
                <button class='supplyButton' onClick="submitSupplyForm()">Supply</button>
            `
            appDiv.innerHTML = hmtlMaintenacePage
        }
        if (XMLrequest.status === 500) {
            const appDiv = document.getElementById('app');
            appDiv.innerHTML = `
                <div>
                    <h3 class="alertMessage">An error occured in the server</h3>
                </div>
            `
        }
        
    }

    XMLrequest.send();
}
document.getElementById('Maintenance').addEventListener('click',  loadMaintenanceInput);

const submitSupplyForm = () => {
    const inputs = document.getElementsByClassName('inputMaintenance');
    let counter=0
    let stringAPIpost = ''
    let invalidInput = false
    let invalidInputFieldName = ''
    for (key in billsAndCoinsModel) {
        const input = inputs[counter];
        if (input.value === '' || (Number(input.value) != Number(input.value).toFixed(0))){
            invalidInput=true
            const nameSeparationKey = key.split('_')
            if(nameSeparationKey[0] == 'bill'){
                invalidInputFieldName += `${nameSeparationKey[1]}$ bills;`;
            } else {
                invalidInputFieldName += `${nameSeparationKey[1]}c coins;`;
            }
            
        }
        let value = (input.value);
        
        counter<inputs.length-1 ? stringAPIpost += key + '=' + value + "&" : stringAPIpost += key + '=' + value
        counter++;
    }

    if (!invalidInput) {
        const XMLrequest = new XMLHttpRequest();
        

        XMLrequest.open('POST', '/supply?'+stringAPIpost, true);
        XMLrequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        XMLrequest.onload = () => {
            loadMaintenanceInput()
        }
        XMLrequest.send();
    } else {
        const maintenanceSupplyResult = document.getElementById("maintenanceSupplyResult")
        const splittedMessage = invalidInputFieldName.split(';')
        let message = `<h4 class="alertMessage">The following fields have not allowed values! Please insert positive and integer numbers</h4><ul>`
        for (item in splittedMessage) {
            if(splittedMessage[item] != ''){
                const messageHTML = splittedMessage[item]
                message += `<li>${messageHTML}</li>`
            }
        }
        message += `</ul>`
        maintenanceSupplyResult.innerHTML = message
    }
}
loadWithdrawInput()
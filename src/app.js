//You go to an ATM and wish to withdraw money. Write a program that, given any amount of money to withdraw, 
//will give you the least amount of bills (Available bills: $1, $2, $5, $10, $20, $50, $100) and coins (0.01, 0.05, 0.10, 0.50).

// - The program should start with specific quantities of available bills and coins.
// - The user will enter any amount they wish to withdraw and the program should return the least number of bills and coins for that amount.
// - During execution, the program should keep track of the available quantities of each bill and coin.
// - In case there is not enough money on the ATM for the amount to be withdrawn, a customized Exception should be thrown.

// ASSUMPTIONS:
// - The available bills are $1, $2, $5, $10, $20, $50, $100.
// - The available coins are 1c, 5c, 10c, 25c, 50c.
// (OPTIONAL) Make the starting available quantities easily configurable.
// (OPTIONAL) Write unitary tests to cover different scenarios.
// (OPTIONAL) Expose the functionality through a REST API.

const fs = require('fs');
require('dotenv').config();
const express = require('express')
const path = require('path');
const app = express()
const publicPath = path.resolve(__dirname, '../public');

let billsAndCoins = {
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

const exchangeRate = {
        'brl': 1,
        'USD': 4.4,
        'FRM' : 0.5
}

const parseCSVData = (csvData) => {
    const lines = csvData.split("\r\n");
    const parsedData = {};
    for (const line of lines) {
        const [objectItem, value] = line.split(",");
        parsedData[objectItem] = Number(value);
    }
    return parsedData;
};

const updateFromCSVToBillsAndCoins = (csvData) => {
    const parsedData = parseCSVData(csvData);
    Object.assign(billsAndCoins, parsedData);
};
  
const readStorageCSV = async (operation) => {
    try {
        const data = await fs.promises.readFile(process.env.CSV_STORAGE_FILE, 'utf8');
        if(operation === 'update'){
            updateFromCSVToBillsAndCoins(data);
        } else if(operation === ''){
            return 'Missing operation';
        }      
        return 'Completed';
    } catch (err) {
        throw new Error(('Error reading CSV file: ' + err.message));
    }
};

const writeStorageCSV = async (data) => {
    try {
        await fs.promises.writeFile(process.env.CSV_STORAGE_FILE, data ,'utf8');
        updateFromCSVToBillsAndCoins(data);
    } catch (err) {
        throw new Error("An error occurred while writing the data to the database. " + err.message)
    }
};

const supplyBillsAndCoinsToCSV = async (object) => {
    // let csvFormatFile = '';
    // let counter = 0;
    // for (const key in billsAndCoins) {
    //     if (object.hasOwnProperty(key) && isSupply){
    //         billsAndCoins[key] = Number(object[key])
    //     } else if(object.hasOwnProperty(key)){
    //         billsAndCoins[key] = 0
    //     }
    //     counter !== 11 ? csvFormatFile += key +','+billsAndCoins[key]+'\r\n':  csvFormatFile += key +',' +billsAndCoins[key]
    //     counter ++
        
    // }
    // await writeStorageCSV(csvFormatFile)
    let isFirstLoop = true
    let csvFormatFile = '';
    for (const key in billsAndCoins) {
        
        if (object.hasOwnProperty(key)){
            billsAndCoins[key] = Number(object[key])
        } else {
            billsAndCoins[key] = 0
        }
        if (!isFirstLoop) {
            csvFormatFile += '\r\n'
        } 
        csvFormatFile += key +',' +billsAndCoins[key]
        isFirstLoop = false
    }
    await writeStorageCSV(csvFormatFile)
}

const supplyBillsAndCoinsValidator = (object) => {
    let billsAndCoinsBuffer = {...billsAndCoins}
    for (const key in billsAndCoinsBuffer) {
        if (object.hasOwnProperty(key)){
            const value = Number(object[key]).toFixed(0);
            if(isNaN(value) || value < 0 || Number(object[key])!=value) {
                console.log(value, object[key])
                throw new Error("Invalid value {"+object[key]+"} in the parameter: " +key)
            }
        }
    }
    return true
}

const moneyAvailability = () => {
    let totalAvailable = 0
    for (element in billsAndCoins) {
        totalAvailable += billsAndCoins[element]*Number(element.split("_")[1])
    }
    return Number(totalAvailable.toFixed(2))
}

const calculateBillsAndCoins = (amount) => {
    let remainingAmount = new Number(amount)
    remainingAmount = remainingAmount.toFixed(2)
    if (moneyAvailability()>=remainingAmount) {
        const billsAndCoinsBuffer = {...billsAndCoins}
        let amountResult = {}
        let billCoin_counter = 0
        for (element in billsAndCoins) { 
            billCoin_counter = Math.floor(remainingAmount / (Number(element.split("_")[1]).toFixed(2)))
            if(billCoin_counter>billsAndCoins[element]){
                billCoin_counter = billsAndCoins[element]
            }
            billCoin_counter ? (
                amountResult[element] = billCoin_counter,
                billsAndCoins[element] = billsAndCoins[element]-billCoin_counter
            )  : {}
            remainingAmount = (Number(remainingAmount).toFixed(2)) - ((Number(element.split("_")[1]).toFixed(2))*billCoin_counter)
        }
        if ((remainingAmount)>0){
            billsAndCoins = {...billsAndCoinsBuffer}
            throw new Error("An error occured while processing the withdraw request! There are no coins and bills available for this amount")
        }
        try {
            supplyBillsAndCoinsToCSV(billsAndCoins, false)
        } catch (e) {
            throw new Error(e.message)
        }
        return amountResult
    } else {
        throw new Error("Not enough money available to withdraw")
    }
}

app.get('/', async (req, res) => {
    try {
        res.status(200).sendFile(path.join(publicPath, 'index.html'));
    } catch (error) {
        res.status(500).send("An error occurred while loading the page: " + error.message);
    }
    
});

app.get('/moneyAvailable', async (req, res) => {
    try {
        await readStorageCSV('update')
        res.status(200).send({moneyAvailable: moneyAvailability(), billsAndCoins})
    } catch (err) {
        res.status(500).send({error: err.message})
    }
})

app.get('/withdraw', async(req, res) => {
    console.log(req.params.currency)
    const currencyType = req.params.currency
    const total = exchangeRate[currencyType]*req.query.money
    console.log(total)
    
    
    if(req.query.money !== NaN && req.query.money > 0){
        try {
            await readStorageCSV('update')
            const moneyToWithdraw = new Number(total)
            const billAndCoinsCalculated = calculateBillsAndCoins(moneyToWithdraw.toFixed(2))
            res.status(200).json(billAndCoinsCalculated)
        } catch (err) {
            switch (err.message) {
                case "An error occured while processing the withdraw request! There are no coins and bills available for this amount":
                    res.status(409).send({error:err.message, billsAndCoins: billsAndCoins})
                    break;
                case "Not enough money available to withdraw":
                    res.status(403).send({error:err.message})
                    break;
                default:
                    res.status(500).send({error:err.message})
            }
        }
    } else {
        if (req.query.hasOwnProperty('money')) {
            res.status(400).send({error:"Invalid value for the 'money' key! Please enter a valid, positive number greater than 0. EX: money=250.50"})
        } else {
            res.status(400).send({error:"The property 'money' is not set in the body request!"})
        }
    }
})

app.post('/supply', async(req, res) => {
    try {
        await readStorageCSV('update')
        supplyBillsAndCoinsValidator(req.query)
        await supplyBillsAndCoinsToCSV(req.query, true)
        res.status(200).json({requestBody: billsAndCoins})
    } catch (err) {
        const errorMessage = err.message.toString()
        if (errorMessage.includes('Error reading CSV file:')){
            res.status(500).json({error: "An error occured while communicating with the database. Transaction cancelled", requestBody: req.query})
        } else {
            res.status(500).json({error: err.message.toString()})
        }
    }
})

app.use(express.static(publicPath));

module.exports = app;
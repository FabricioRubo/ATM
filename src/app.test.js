const request = require('supertest');
const app = require('./app');
const path = require('path');
const fs = require('fs');


describe('Test withdraw endpoint', () => {
    const fullCash = {
        'bill_100': 100,
        'bill_50': 100,
        'bill_20': 100,
        'bill_10': 100,
        'bill_5': 100,
        'bill_2': 100,
        'bill_1': 100,
        'coin_.50': 100,
        'coin_.25': 100,
        'coin_.10': 100,
        'coin_.05': 100,
        'coin_.01': 100,
    }
    const almostEmptyCash = {
        'bill_100': 0,
        'bill_50': 1,
        'bill_20': 5,
        'bill_10': 0,
        'bill_5': 0,
        'bill_2': 1,
        'bill_1': 0,
        'coin_.50': 15,
        'coin_.25': 1,
        'coin_.10': 0,
        'coin_.05': 50,
        'coin_.01': 3,
    }
    const testCasesWithdraw =  [
        {
            name: 'Test valid withdraw value',
            withdrawValue: '63.97',
            cash : fullCash,
            expectedBody : {
                    'bill_50': 1,
                    'bill_10': 1,
                    'bill_2': 1,
                    'bill_1': 1,
                    'coin_.50': 1,
                    'coin_.25': 1,
                    'coin_.10': 2,
                    'coin_.01': 2,
            },
            expectedStatus: 200,
        },
        {
            name: 'Test valid withdraw value without bills',
            withdrawValue: '0.14',
            cash : fullCash,
            expectedBody : {
                    'coin_.10': 1,
                    'coin_.01': 4
            },
            expectedStatus: 200,
        },
        {
            name: 'Test valid withdraw value without coins',
            withdrawValue: '188',
            cash : fullCash,
            expectedBody : {
                'bill_100': 1,
                'bill_50': 1,
                'bill_20': 1,
                'bill_10': 1,
                'bill_5': 1,
                'bill_2': 1,
                'bill_1': 1,
            },
            expectedStatus: 200,
        },
        {
            name: 'Test valid withdraw with almost empty cash',
            withdrawValue: '100',
            cash : almostEmptyCash,
            expectedBody : {
                'bill_50': 1,
                'bill_20': 2,
                'bill_2': 1,
                'coin_.50': 15,
                'coin_.25': 1,
                'coin_.05': 5,
            },
            expectedStatus: 200,
        },
        {
            name: 'Test withdraw with not enough cash available to withdraw',
            withdrawValue: '300',
            cash : almostEmptyCash,
            expectedBody : {
                'error': "Not enough money available to withdraw"
            },
            expectedStatus: 403,
        },
        {
            name: 'Test withdraw with not enough bills and coins available to withdraw',
            withdrawValue: '50.04',
            cash : almostEmptyCash,
            expectedBody : {
                'error': "An error occured while processing the withdraw request! There are no coins and bills available for this amount",
                billsAndCoins: almostEmptyCash
            },
            expectedStatus: 409,
        },
        {
            name: 'Test withdraw with empty entry',
            withdrawValue: '',
            cash : almostEmptyCash,
            expectedBody : {
                'error': "Invalid value for the 'money' key! Please enter a valid, positive number greater than 0. EX: money=250.50",
            },
            expectedStatus: 400,
        },
        {
            name: 'Test withdraw with invalid entry',
            withdrawValue: 'çldtsftg',
            cash : almostEmptyCash,
            expectedBody : {
                'error': "Invalid value for the 'money' key! Please enter a valid, positive number greater than 0. EX: money=250.50",
            },
            expectedStatus: 400,
        },
    ]  
    for (const tc of testCasesWithdraw) {
        test(tc.name, async () => {
            
            const postResponse = await request(app).post(`/supply?bill_100=${tc.cash['bill_100']}&bill_50=${tc.cash['bill_50']}&bill_20=${tc.cash['bill_20']}&bill_10=${tc.cash['bill_10']}&bill_5=${tc.cash['bill_5']}&bill_2=${tc.cash['bill_2']}&bill_1=${tc.cash['bill_1']}&coin_.50=${tc.cash['coin_.50']}&coin_.25=${tc.cash['coin_.25']}&coin_.10=${tc.cash['coin_.10']}&coin_.05=${tc.cash['coin_.05']}&coin_.01=${tc.cash['coin_.01']}`);
            expect(postResponse.statusCode).toBe(200);
            const response = await request(app).get(`/withdraw?money=${tc.withdrawValue}`);
            

            expect(response.statusCode).toBe(tc.expectedStatus);
            expect(response.body).toEqual(
                expect.objectContaining(tc.expectedBody)
            );
            
        });
    }
});
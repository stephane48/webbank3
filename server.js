/* Student name: Stephane Kamdem Kamguia

 Student Id: 135736189

 Insturctor: George Tsang

 Heroku website URL: https://stephane-kamdem-web-bank3.herokuapp.com/

 Assignment 3 - Web 322 - Web Bank
*/


const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const exphbs = require("express-handlebars");
const fs = require("fs");
const path = require("path");
const session = require("client-sessions");
const bodyParser = require("body-parser");
const randomStr = require("randomstring");
const userPath = "./user.json";
const accountsPath = "./accounts.json";
const maxAccountLimit = 2;              
var myAccountSelection;
var userDataDB = {};          
var userAccountsOnly = {}; 
var userAccountType;   
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());         


var userData = readFileData(userPath);    
var accountsData = readFileData(accountsPath);   

const MongoClient = require('mongodb').MongoClient;
const { Db } = require("mongodb");
const uri = "mongodb+srv://user-123:user-123@mini-mern-tut.7zwp9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbName = "db_banking";
const objCollection = "web322";

 
app.use(express.static(path.join(__dirname, '/public')));

app.engine(".hbs", exphbs({ 												
    extname: ".hbs",                                                        
    defaultLayout: false,                                                   
    layoutsDir: path.join(__dirname, "/views")                              
}));

app.set("view engine", ".hbs");

var strRandom = randomStr.generate();



//reference from course materials - npm client-sessions.js
app.use(session({															

    cookieName: "MySession",
    secret: strRandom,      												//	random string
    duration: 5 * 60 * 1000,												//	5 minutes
    activeDuration: 1 * 60 * 1000,											//	1 minutes
    httpOnly: true,                                                         //  prevents browser JavaScript from accessing cookies
    secure: true,                                                           //  ensures cookies are only used over https
    ephemeral: true                                                         //  deletes the cookie when the browser is closed

}));


//app.gets 

app.get("/", (req, res) => {

    req.MySession.user = "Unknown";
    res.render('index', {                                                
    });

});

app.get("*", (req, res) => {
    res.send(`FAILED! Fix your URL.`);
});


//app.posts
app.post("/", (req, res) => {
    var iUsername = req.body.username;
    var iPassword = req.body.password;

    var messageData = {
        message: errorCheck(iUsername, iPassword),
        visible: true
    };

    if (userValidation(iUsername, iPassword)) {

        req.MySession.user = req.body.username;

        getUserDataDB(req.MySession.user).then(() => {

            console.log(`user data captured from mongo for user: ${userDataDB.Username}`);

            updateUserAccounts();

            var someData = {
                user: req.MySession.user,
                accounts: userAccountsOnly
            };

            res.render('bank', {                                                
                data: someData
            });

        })



    } else {

        res.render('index', {
            data: messageData
        });
    }

});

app.post('/bankForm', (req, res) => {

    var selectionValue = req.body.select;
    console.log(selectionValue);
    var accountNum = req.body.accountsList;


    console.log(selectionValue);

    var someData = {
        message: statusMessage(3),
        visible: true,
        user: req.MySession.user,
        accounts: userAccountsOnly

    };
    console.log(`user name: ${req.MySession.user}`);
    console.log(`can create chequing: ${canCreateChequing(userDataDB)}`);
    console.log(`can create savings: ${canCreateSavings(userDataDB)}`);
    console.log(`the user has ${checkNumAccounts(userDataDB)}`);
    console.log(`Can create account? : ${canCreateAccount(userDataDB)}`)

    var accData = {
        chequing: canCreateChequing(userDataDB),
        savings: canCreateSavings(userDataDB)
    };

    if (selectionValue == "openAccount" && canCreateAccount(userDataDB)) {
        res.render('accountopen', {
            data: accData

        });
        return;   
    }

    if (selectionValue !== "openAccount" && selectionValue !== "") {
        myAccount = formatAccNumber(accountNum);
        console.log(myAccount);
        selectionRender(selectionValue, res, myAccount);    
        myAccountSelection = myAccount;
    }
    else {
        res.render('bank', {
            data: someData
        });

    }


});

app.post("/returnBank", (req, res) => {

    var someData = {
        user: req.MySession.user,
        accounts: userAccountsOnly
    };

    res.render('bank', {
        data: someData
    });

});

app.post('/accountOpen', (req, res) => {
    console.log("account open");
    userAccountType = req.body.accountSelection;
    var acctNum = createAcctNum();
    console.log("This data is being fed into createAccount:  " + acctNum);
    createAccount(acctNum, userAccountType, req, res);

});

app.post('/depositForm', (req, res) => {

    var amount = req.body.depositAmount;
    console.log(amount);

    tempObj = readFileData(accountsPath);

    if (myAccountSelection == "") {
        console.log("Account not correctly selected")
    }
    else {
        depositAccount(myAccountSelection, amount)
        var someData = {
            user: req.MySession.user,
            accounts: userAccountsOnly
        };

        res.render('bank', {
            data: someData
        });
    }



});

app.post('/withdrawalForm', (req, res) => {

    var amount = req.body.withdrawAmount;
    console.log(amount);

    if (myAccountSelection == "") {
        console.log("Account not correctly selected")
    }
    else {
        withdrawAccount(myAccountSelection, amount, req, res)
    }


});


app.post("/reset", (req, res) => {



    req.MySession.user = "Unknown";
    req.MySession.reset();


    res.render('index', {
    });

});

const server = app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});



//functions
function readFileData(path) {
    let rawData = null;
    let data = null;

    rawData = fs.readFileSync(path);
    console.log(`raw data: ${rawData}`);
    data = JSON.parse(rawData);
    return data;
}

//./accounts.json
function writeFileData(data, path) {
    fs.writeFile(path, JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;

        console.log("File successfully updated.");
    });
}


function userValidation(username, password) {
    userCheck = userData.hasOwnProperty(username);        
    passCheck = (userData[username] === password);   

    if (userCheck && passCheck) {
        console.log(username, " is validated");
        return true;
    }

    else {
        console.log(username, " is not validated!")
        return false;
    }
}


function errorCheck(username, password) {
    if (userData.hasOwnProperty(username) === false) {
        return statusMessage(1);
    }

    if (userData.hasOwnProperty(username) === true) {
        if (userData[username] !== password) {
            return statusMessage(2);
        }
    }
}


function statusMessage(code) {

    switch (code) {
        case 1:
            string = "Not a registered username";
            return string;
            break;
        case 2:
            string = "Invalid password";
            return string;
            break;
        case 3:
            string = "User has more than 2 accounts";
            return string;
            break;
        case 4:
            string = "Insufficient Funds";
            return string;
            break;

        default:
            string = "Unknown Error";
            return string;

    }

}

function selectionRender(selection, res, myAccount) {

    tempObj = readFileData(accountsPath);

    var accountID = { accountID: myAccount };
    accountData = tempObj[myAccount];

    console.log(accountData);

    switch (selection) {
        case "balance":
            res.render('balance', {
                data: accountData,
                data1: accountID
            });
            console.log(accountsData);
            break;
        case "deposit":
            res.render('deposit', {
                data: accountData,
                data1: accountID
            });
            break;

        case "withdrawal":
            res.render('withdrawal', {
                data: accountData,
                data1: accountID
            });
            break;
        default:
            res.render('bank', {
            });
    }
}

function checkValidAccount(accountNum) {   // checks if account is in accountsData javascript object (old function assignemt2)

    if (accountsData.hasOwnProperty(formatAccNumber(accountNum))) {
        //create an myAccount object with all necessary data needed to render
        return true;
    }
    else {
        console.log("not valid account number");
        myAccount = null;
        return false;
    }

}


function formatAccNumber(number, size = 7) {   //Function to add leading zero(s)   default value is of size is 7 to match account data
    let formatNumber;
    formatNumber = number.padStart(size, '0');
    formatNumber = "1" + formatNumber.slice(1);
    console.log(formatNumber);
    return formatNumber;

}


function depositAccount(acctNum, amount) {


    var balance = tempObj[acctNum].accountBalance;

    console.log("balance before: " + balance);

    balance = parseFloat(balance, 10);
    amount = parseFloat(amount, 10);

    console.log("balance float: " + balance);

    balance = balance + amount;

    console.log("after addition balance: " + balance);

    tempObj[acctNum] = { "accountType": tempObj[acctNum].accountType, "accountBalance": balance };

    console.log(tempObj);

    writeFileData(tempObj, accountsPath);


}

function withdrawAccount(acctNum, amount, req, res) {
    var balance = tempObj[acctNum].accountBalance;

    var messageData = {
        message: statusMessage(4),
        visible: true,
        user: req.MySession.user,
        accounts: userAccountsOnly
    };

    var userData = {
        user: req.MySession.user,
        accounts: userAccountsOnly
    }


    console.log("balance before: " + balance);

    balance = parseFloat(balance, 10);
    amount = parseFloat(amount, 10);

    console.log("balance float: " + balance);

    if (amount > balance) {
        console.log("Cannot Withdrawal more than Account Balance");

        res.render('bank', {
            data: messageData
        });

    }

    else {
        balance = balance - amount;

        console.log("after subtraction balance: " + balance);

        tempObj[acctNum] = { "accountType": tempObj[acctNum].accountType, "accountBalance": balance };

        console.log(tempObj);

        writeFileData(tempObj, accountsPath);

        res.render('bank', {
            data: userData
        });

    }




}


function createAccount(acctNum, userAccountType, req, res) {
    let tempObj = {};
    var change = false;
    tempObj = readFileData(accountsPath);

    if (tempObj.hasOwnProperty("acctNum"))
        change = false;
    else {
        (tempObj[acctNum] = { "accountType": userAccountType, "accountBalance": 0.0 });
        change = true;
    }

    if (change) {
        tempObj["lastID"] = acctNum;
        writeFileData(tempObj, accountsPath);

        insertUserAccountsDB(acctNum, userAccountType).then(() => {
            console.log(`${userAccountType} Account # ${acctNum} saved to mongoDB`);
            getUserDataDB(userDataDB['Username']).then(() => {

                updateUserAccounts();

                var someData = {
                    user: req.MySession.user,
                    accounts: userAccountsOnly
                }

                var messageData = {
                    accountID: acctNum,
                    accountType: userAccountType,
                    visible: true
                };

                res.render('bank', {
                    data: someData,
                    data1: messageData
                });
                console.log("MongoDb read")
            });
        });

    }


    console.log(tempObj);
}

function checkLastID() {
    tempObj = readFileData(accountsPath);
    lastID = tempObj["lastID"];
    console.log("Last ID is: " + lastID);
    return lastID;
}

function createAcctNum() {
    tempObj = readFileData(accountsPath);
    lastID = checkLastID();
    var tempNum;
    var acctNumber;

    if (canCreateChequing(userDataDB) && !(canCreateSavings(userDataDB))) {
        console.log("account number should be subtracted by 1");
        tempNum = parseInt(userAccountsOnly['Savings'], 10);
        tempNum = tempNum - 1;
        acctNumber = tempNum.toString();
    } else if (canCreateSavings(userDataDB) && !(canCreateChequing(userDataDB))) {
        console.log("account number should be added by 1");
        tempNum = parseInt(userAccountsOnly['Chequing'], 10);
        tempNum = tempNum + 1;
        acctNumber = tempNum.toString();
    } else {
        console.log("account number should be brand new set");
        tempNum = parseInt(lastID, 10);
        if (tempNum % 2 === 0) {
            tempNum += 9;
        } else {
            tempNum += 10;
        }

        acctNumber = tempNum.toString();
    }

    while (tempObj.hasOwnProperty(acctNumber)) { //will keep checking till gets closest account number not used - avoid conflict
        console.log("Account number already exists: " + tempObj.hasOwnProperty(acctNumber));
        tempNum++;
        acctNumber = tempNum.toString();
    }

    acctNumber = formatAccNumber(acctNumber);



    console.log(acctNumber);
    return acctNumber;
}

function canCreateAccount(userDataDB) {
    if (canCreateChequing(userDataDB) || canCreateSavings(userDataDB)) {
        if (checkNumAccounts(userDataDB) < maxAccountLimit) {
            return true;
        }
    }
    else {
        return false;
    }
}

function canCreateChequing(userDataDB) {
    if (userDataDB['Chequing']) {
        return false;
    } else {
        return true;
    }
}
function canCreateSavings(userDataDB) {
    if (userDataDB['Savings']) {
        return false;
    } else {
        return true;
    }
}

function checkNumAccounts(userDataDB) {

    let count = 0;

    if (userDataDB['Chequing'] === null && userDataDB['Savings'] === null) {
        count = 0;
    } else if (userDataDB['Chequing'] && userDataDB['Savings'] === null) {
        count = 1;
    } else if (userDataDB['Chequing'] === null && userDataDB['Savings']) {
        count = 1;
    } else if (userDataDB['Chequing'] && userDataDB['Savings']) {
        count = 2;
    }

    return count;

}

async function getUserDataDB(user) {  //gets user related  data from database and saves to userAccounts or Null if not found

    let db, result;

    try {
        const client = await MongoClient.connect(uri);
        db = client.db(dbName);
    } catch (err) {
        console.log(`err = ${err}`);
    }

    try {
        result = await db.collection(objCollection).findOne({ Username: user });       //  returns null when findOne was unsuccessful
        console.log(result);
        userDataDB = result;
    } catch (err) {
        console.log(`err = ${err}`);
    }


}

function updateUserAccounts() {

    if (userDataDB['Chequing']) {
        console.log(userDataDB['Chequing']);
        Object.assign(userAccountsOnly, { Chequing: userDataDB['Chequing'] });
    }
    if (userDataDB['Savings']) {
        console.log(userDataDB['Savings']);
        Object.assign(userAccountsOnly, { Savings: userDataDB['Savings'] });
    }

    if (!(userDataDB['Chequing']) && !(userDataDB['Savings'])) {
        userAccountsOnly = {};
    }

    console.log(userAccountsOnly);

}


async function insertUserAccountsDB(acctNum, userAccountType) {

    //this function will update mongodb with new created accounts

    var updateValue = {};    // using to update object (otherwise creates new field)
    updateValue[userAccountType] = acctNum;

    let db, result;

    try {

        const client = await MongoClient.connect(uri);
        db = client.db(dbName);
    } catch (err) {
        console.log(`err = ${err}`);
    }

    try {

        result = await db.collection(objCollection).findOneAndUpdate(
            { Username: userDataDB['Username'] },
            {
                $set: updateValue                                                     //  use $set to ensure only the identified fields are affected


            },
            { returnOriginal: false }                                  //  false = returns the updated doc; true = returns the original doc
        );
        console.log(result);
    } catch (err) {
        console.log(`err = ${err}`);
    }


}

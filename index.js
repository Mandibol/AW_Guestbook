const { json } = require("express");
const express = require("express");
const app = express();
let fs = require("fs");

app.use(express.static("Public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.listen(3000);
console.log("Kör servern på localhost:3000");


const postsPath = 'posts.json';

//Function to escape bad html
function escapeHTML(obj) {
    const tempObj = obj;
    for (let x in obj) {
        tempObj[x] = (obj[x]).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };
    return tempObj;
}

//redirect to frontpage
app.get("/", (req,res) => {
    res.sendFile(__dirname + "/index.html");
});

//Manage comment request
app.post("/process_post",(req,res) => {
    fs.readFile(postsPath, (err,data) =>{
        let postsArray = [];
        if (!err) {
            //Create Array from data
            postsArray = JSON.parse(data);
        }
        //Escape bad html chars
        let reqObj = escapeHTML(req.body);
        //Add comment to array
        postsArray.push(reqObj);
        //Replace posts.json with updated array
        fs.writeFile(postsPath, JSON.stringify(postsArray, null,2), (err) => {
            if (err) throw err;
            res.end();
        });
    });
 });

 //Refresh Comment field
app.post("/refresh_posts", (req,res) => {
    fs.readFile(postsPath, (err,data) =>{
        let postsArray = [];
        if (!err) {
            //Create Array from data
            postsArray = JSON.parse(data);
        }
        res.send(postsArray);
    });
});

//Create new user
app.post("/create_user", (req,res) => {
    //Escape Bad html
    let newUserObj = escapeHTML(req.body);
    fs.readFile('users.json', (err,data) =>{
        if (err) throw err;
        const usersArray = JSON.parse(data);
        //Check against existing user if name or email is in use
        const checkName = usersArray.find(obj => obj.name === newUserObj.name);
        const checkEmail = usersArray.find(obj => obj.email === newUserObj.email);

        let resObj = {};
        if (checkEmail === undefined && checkName === undefined) {
            resObj.alert = "Grattis ditt konto är skapat. Du kan nu logga in";
            resObj.success = true;
            usersArray.push(newUserObj);
            fs.writeFile('users.json', JSON.stringify(usersArray, null, 2), (err) => {
                if (err) throw err;
            });
        }
        else if (checkName !== undefined && checkEmail !== undefined){
            resObj.alert = "Ånej Användarnamnet är upptaget\nDet finns redan ett konto med den mejladdressen";
            resObj.success = false;
        }
        else if (checkEmail !== undefined){
            resObj.alert = "Det finns redan ett konto med den mejladdressen";
            resObj.success = false;
        }
        else if (checkName !== undefined){
            resObj.alert = "Ånej Användarnamnet är upptaget";
            resObj.success = false;
        }
        res.send(JSON.stringify(resObj));
    });
});

//Login
app.post("/login", (req,res) => {
    let loginObj = escapeHTML(req.body);
    fs.readFile('users.json', (err,data) =>{
        if (err) throw err;
        const usersArray = JSON.parse(data);
        //Check against existing user if name and psw match
        const userObj = usersArray.find(obj => obj.name === loginObj.name);
        let resObj = {};

        if (userObj){
            if (userObj.psw === loginObj.psw){
                resObj.name = userObj.name;
                resObj.login = true;
            }
            else {
                resObj.alert = "Fel Lösenord";
                resObj.login = false;
            }
        }
        else {
            resObj.alert = "Finns ingen användare med det namnet"
            resObj.login = false;
        }
        res.send(JSON.stringify(resObj));
    });
});
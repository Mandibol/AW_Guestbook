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

//Functions to escape bad html
function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function escapeObj(obj) {
    const tempObj = obj;
    for (let x in obj) {
        tempObj[x] = escapeHTML(obj[x]);
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
        if (err) throw err;
        //Create Array from data
        let posts = JSON.parse(data);
        //Escape bad html chars
        let reqTemp = escapeObj(req.body);
        //Add comment to array
        posts.push(reqTemp);
        //Replace posts.json with updated array
        fs.writeFile(postsPath, JSON.stringify(posts), (err) => {
            if (err) throw err;
            res.end();
        });
    });
 });

 //Refresh Comment field
app.post("/refresh_posts", (req,res) => {
    fs.readFile(postsPath, (err,data) =>{
        if (err) throw err;
        let posts = JSON.parse(data);
        res.send(posts);
    });
});

//Create new user
app.post("/create_user", (req,res) => {
    //Escape Bad html
    let newUser = escapeObj(req.body);
    fs.readFile('users.json', (err,data) =>{
        if (err) throw err;
        const users = JSON.parse(data);
        //Check against existing user if name or email is in use
        const checkName = users.find(obj => obj.name === newUser.name);
        const checkEmail = users.find(obj => obj.email === newUser.email);

        let answer = {};
        if (checkEmail === undefined && checkName === undefined) {
            answer.alert = "Grattis ditt konto är skapat. Du kan nu logga in";
            answer.success = true;
            users.push(newUser);
            fs.writeFile('users.json', JSON.stringify(users), (err) => {
                if (err) throw err;
            });
        }
        else if (checkName !== undefined && checkEmail !== undefined){
            answer.alert = "Ånej Användarnamnet är upptaget\nDet finns redan ett konto med den mejladdressen";
            answer.success = false;
        }
        else if (checkEmail !== undefined){
            answer.alert = "Det finns redan ett konto med den mejladdressen";
            answer.success = false;
        }
        else if (checkName !== undefined){
            answer.alert = "Ånej Användarnamnet är upptaget";
            answer.success = false;
        }
        res.send(JSON.stringify(answer));
    });
});

//Login
app.post("/login", (req,res) => {
    let login = escapeObj(req.body);
    fs.readFile('users.json', (err,data) =>{
        if (err) throw err;
        const users = JSON.parse(data);
        //Check against existing user if name and psw match
        const checkName = users.find(obj => obj.name === login.name);
        let answer = {};

        if (checkName !== undefined){
            if (checkName.psw === login.psw){
                answer.name = checkName.name;
                answer.login = true;
            }
            else {
                answer.alert = "Fel Lösenord"
                answer.login = false;
            }
        }
        else {
            answer.alert = "Finns ingen användare med det namnet"
            answer.login = false;
        }
        res.send(JSON.stringify(answer));
    });
});
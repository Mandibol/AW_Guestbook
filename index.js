const { json } = require("express");
const express = require("express");
const app = express();
let fs = require("fs");

app.use(express.static("Public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.listen(3000);
console.log("Kör servern på localhost:3000");


const postsPath = 'public/posts.txt';

//Initiate posts array and load it from file
let posts = [];
fs.readFile(postsPath, (err,data) =>{
    if (err) throw err;
    posts = JSON.parse(data);
});

//redirect to frontpage
app.get("/", (req,res) => {
    res.sendFile(__dirname + "/index.html");
});

//
app.post("/process_post",(req,res) => {
    //Lägg till kommentaren till array comments
    posts.push(req.body);
    //Ersätt och Uppdatera comments.txt
    fs.writeFile(postsPath, JSON.stringify(posts), (err) => {
         if (err) throw err;
    });
    res.end();
 });

app.post("/refresh_posts", (req,res) => {
     res.send(posts);
});
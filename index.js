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
let posts = [];


fs.readFile(postsPath, (err,data) =>{
    if (err) throw err;
    posts = JSON.parse(data);
    //console.log(posts);
});



app.get("/", (req,res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/process_post",(req,res) => {
    //Skapa ett objekt av kommentaren för JSON
    let post = {};
    post.date = new Date();
    post.userName = req.body.userName;
    post.comment = req.body.comment;
    //Lägg till kommentaren till array comments
    posts.push(post);
    //Ersätt och Uppdatera comments.txt
    fs.writeFile(postsPath, JSON.stringify(posts), (err) => {
         if (err) throw err;
    });
    res.send(posts);
 });

 app.post("/ajax", (req,res) => {
     res.send(posts);
});
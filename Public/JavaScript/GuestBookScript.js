const user = {};
user.name = "Guest";
user.posts = 0;

//Function to Print and refresh posts
function refreshPosts() {
    const client = new XMLHttpRequest();
    client.open('post', '/refresh_posts', true);
    client.onload= () => {
        let displayHTML = "";
        const posts = JSON.parse(client.responseText);            
        
        for (let i = 0; i < posts.length; i++) {
            //Post Layout
            const date = (posts[i].date).substring(0,10);
            const time = (posts[i].date).substring(11,16);
            displayHTML += '<section>'
            displayHTML += `<h3>Användare: ${posts[i].userName}</h3>`;
            displayHTML += `<h4>Postat: ${date} , ${time}</h4>`;
            displayHTML += `<p>${posts[i].comment}</p>`;
            displayHTML += '</section>'
        }
        document.getElementById("comments").innerHTML = displayHTML;
    };
    client.setRequestHeader("Content-type", "application/json; charset=utf-8");
    client.send();
}

//function to send form data to server
function sendPost(formJSON){
    const client = new XMLHttpRequest();
    client.open('post', '/process_post', true);
    client.onload= () => {
        refreshPosts();
    };
    client.setRequestHeader("Content-type", "application/json; charset=utf-8");
    client.send(formJSON);
}

//Wait for site to load before continue
window.onload = () => {
    //Get and print current posts
    refreshPosts();

    //Submit Post
    document.getElementById("commentForm").addEventListener("submit", function(evt){
        //Prevent Default
        evt.preventDefault();
        //Collect form data
        const objForm = {};
        objForm.userName = document.getElementById("userName").value;
        objForm.comment = document.getElementById("comment").value;
        objForm.date = new Date();
        //validate form data

        //Convert Object to JSON String
        const formJSON = JSON.stringify(objForm);
        console.log(formJSON);
        //Send post to server and refresh
        sendPost(formJSON);

        //Reset Form Field
        document.getElementById("comment").value = "";
        document.getElementById("userName").value = "";
    });
};
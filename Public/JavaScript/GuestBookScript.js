const user = {};
user.name = "Guest";
user.posts = 0;
user.loggedIn = false;

//Function to Print and refresh posts
function refreshPosts() {
    const client = new XMLHttpRequest();
    client.onload= () => {
        let displayHTML = "";
        const posts = JSON.parse(client.responseText);
        user.posts = 0;            
        for (let i = 0; i < posts.length; i++) {
            //Post Layout
            const date = (posts[i].date).substring(0,10);
            const time = (posts[i].date).substring(11,16);
            const comment = (posts[i].comment).replace(/\n/g, "<br>")
            displayHTML += '<section>'
            displayHTML += `<h3>Postat av ${posts[i].userName} ${date} ${time}</h3>`;
            displayHTML += `<p>${comment}</p>`;
            displayHTML += '</section>'
            if (posts[i].userName === user.name) {
            user.posts++;
            }
        }
        document.getElementById("comments").innerHTML = displayHTML;
        let text = `Välkommen ${user.name}! Skriv gärna en kommentar <br> Du har skrivit ${user.posts} kommentarer`;
        document.getElementById("greet").innerHTML = text;
    };
    client.open('post', '/refresh_posts', true);
    client.setRequestHeader("Content-type", "application/json; charset=utf-8");
    client.send();
}

//Wait for site to load before continue
window.onload = () => {
    //Get and print current posts
    refreshPosts();

    //Get form element ids
    const createUserForm = document.getElementById("createUserForm");
    const createUserName = document.getElementById("createUserName");
    const createUserEmail = document.getElementById("createUserEmail");
    const createUserPsw = document.getElementById("createUserPsw");
    const loginForm = document.getElementById("loginForm");
    const loginUserName = document.getElementById("loginName");
    const loginPsw = document.getElementById("loginPsw");
    const commentForm = document.getElementById("commentForm");
    const comment = document.getElementById("comment");

    //Manage what sections are available when logged in
    document.getElementById("createAccountLink").addEventListener("click", (evt) => {
        loginForm.style.display = "none";
        createUserForm.style.display = "block";
    });
    document.getElementById("returnLink").addEventListener("click", (evt) => {
        loginForm.style.display = "block";
        createUserForm.style.display = "none";
    });
    document.getElementById("logOut").addEventListener("click", (evt) => {
        loginForm.style.display = "block";
        commentForm.style.display = "none";
        user.name = "Guest";
        user.loggedIn = false;
    });

    //Submit Post
    commentForm.addEventListener("submit", (evt) => {
        evt.preventDefault();
        //Collect form data
        const objForm = {};
        objForm.userName = user.name;
        objForm.comment = comment.value;
        objForm.date = new Date();
        //Convert Object to JSON String
        const formJSON = JSON.stringify(objForm);
        //Send post to server and refresh
        const client = new XMLHttpRequest();
        client.onload= () => {
            refreshPosts();
        };
        client.open('post','/process_post', true);
        client.setRequestHeader("Content-type", "application/json; charset=utf-8");
        client.send(formJSON);
        //Reset Form Field
        comment.value = "";
    });

    //Create User
    createUserForm.addEventListener("submit", (evt) => {
        evt.preventDefault();
        //Collect form data
        const createUser = {};
        createUser.name = createUserName.value;
        createUser.email = createUserEmail.value;
        createUser.psw = createUserPsw.value;
        //Convert Object to JSON String
        const formJSON = JSON.stringify(createUser);
        //Send createUser request to server
        const client = new XMLHttpRequest();
        client.onload= () => {
            const response = JSON.parse(client.responseText);
            //toggle login form
            if (response.success === true) {
                loginForm.style.display = "block";
                createUserForm.style.display = "none";
            }
            alert(response.alert)
        };
        client.open("post","/create_user", true);
        client.setRequestHeader("Content-type", "application/json; charset=utf-8");
        client.send(formJSON);
        //Reset Form Field
        createUserName.value = "";
        createUserEmail.value = "";
        createUserPsw.value = "";
    });

    //Login
    loginForm.addEventListener("submit", (evt) => {
        evt.preventDefault();
        //Collect form data
        const login = {};
        login.name = loginUserName.value;
        login.psw = loginPsw.value;
        //Convert Object to JSON String
        const formJSON = JSON.stringify(login);
        // Send login request to server
        const client = new XMLHttpRequest();
        client.onload= () => {
            const response = JSON.parse(client.responseText);
            if (response.login){
                user.name = response.name;
                user.loggedIn = response.login;
                loginForm.style.display = "none";
                commentForm.style.display = "block";
                refreshPosts();
            }
            else{
                alert(response.alert);
            } 
        };
        client.open("post","/login", true);
        client.setRequestHeader("Content-type", "application/json; charset=utf-8");
        client.send(formJSON);
        //Reset Form Field
        loginUserName.value = "";
        loginPsw.value = "";
    });
};
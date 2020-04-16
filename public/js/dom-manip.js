const body = document.querySelector('body');
const comments = document.querySelector('#comments');


// Create a new element
const newH2 = document.createElement('h2');

// modify the element
newH2.textContent = "I'm a new h2 tag";

// insert into dom
body.appendChild(newH2);

// Creating an ordered list
const newList = document.createElement('ol');

// Insert 10 list items
for (let i = 0; i < 10; i++) {
    const li = document.createElement('li');
    li.textContent = `Item ${i + 1}`;
    // create a new input
    const checkbox = document.createElement('input');
    // change it's type to checkbox
    checkbox.type = 'checkbox';
    // add it to the list element
    li.appendChild(checkbox);

    // add the finished li to the list
    newList.appendChild(li);
}

body.appendChild(newList);

{/* 
<div class='comment'>
<div class='userInfo'>
    <img src="" alt="" class='avatar--comment'>
    <span class='username'></span>
</div>
<span class='comment--text'></span>
<span class='controls'>
    <button class="upvote--button">Upvote</button>
    <button class="downvote--button">Downvote</button>
    <button class="report--button">Report</button>
    <button class="reply--button">Reply</button>
</span>
</div> 
*/}

// This code creates the html above

function addComment (username, avatar, text) {
    const comment = createComment(username, avatar, text);
    // comments is defined on Line 2
    comments.appendChild(comment);
}

// This will just create the comment element and return it
// it won't add it to the dom
function createComment (username, avatar, text) {
    // create comment
    const commentContainer = document.createElement('div');
    commentContainer.classList.add("comment");
    
    // info container (has avatar image and username)
    // made this a div so it would be a block rather than inline
    const info = document.createElement('div');
    info.classList.add("userInfo")
    // create the avatar element; add the image and the class
    const avatarEl = document.createElement('img');
    avatarEl.src = avatar;
    avatarEl.classList.add("avatar--comment");

    // create the username span add the username and class
    const usernameEl = document.createElement('span');
    usernameEl.textContent = username;
    usernameEl.classList.add("username");

    // add both of these to the info container
    info.appendChild(avatarEl);
    info.appendChild(usernameEl);

    // create the comment text
    const commentText = document.createElement('span');
    commentText.classList.add("comment--text");
    commentText.textContent = text;

    const controlsContainer = document.createElement('span');
    controlsContainer.classList.add("controls");
    // I didn't want to copy/paste a bunch so I made this object
    // so I could use a for loop to create the buttons
    // the keys are the text for the buttons and the values are the 
    // functions the buttons should invoke
    const controls = {
        "Upvote": upvote, 
        "Downvote": downvote, 
        "Report": report, 
        "Reply": reply,
    };
    for (const control in controls) {
        const btn = document.createElement("button");
        btn.textContent = control;
        btn.classList.add(`${control.toLowerCase()}--button`);
        btn.onclick = controls[control];
        // We can use this attribute so when we click the button
        // we know who to upvote/downvote/report/reply to
        // however, this should really be the comment UUID and not
        // the username so you can upvote the specific comment not
        // all of the comments by the same user
        btn.setAttribute('user', username);
        controlsContainer.appendChild(btn);
    }

    // append everything to the comment container
    // order matters here since I want info,comment-text,controls
    // however you can use css for the comment class to style things
    commentContainer.appendChild(info);
    commentContainer.appendChild(commentText);
    commentContainer.appendChild(controlsContainer);
    return commentContainer;
}

function upvote (event) {
    console.log("Clicked upvote");
    // event.target is the element the user clicked
    // in this case the upvote button
    // we can use it to figure out which upvote button was pushed
    // to make it easier you can add some attributes to the button
    // to figure out which comment's upvote button was pushed
    console.log(event.target);
}

function downvote (event) {
    console.log("Clicked downvote");
    console.log(event.target);    
}

function report (event) {
    console.log("Clicked report");
    console.log(event.target);    
}

function reply (event) {
    console.log("Clicked reply");
    console.log(event.target);    
}

// Add some comments
addComment('Alice', `https://avatars.dicebear.com/v2/identicon/${'Alice'}.svg`, "I'm Alice");
addComment('Bob', `https://avatars.dicebear.com/v2/identicon/${'Bob'}.svg`, "I'm Bob");
addComment('Charlie', `https://avatars.dicebear.com/v2/identicon/${'Charlie'}.svg`, "I'm Charlie");
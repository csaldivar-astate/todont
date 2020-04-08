"use strict";

const id = _id => document.getElementById(_id);
let default_items = '';
let local_items = [];

document.querySelector("body").onload = main;


function main() {
    default_items = id('todo-list').innerHTML;
    // get the items from the server as soon as the page loads
    getTodontItems();

    document.getElementById('todo-form').onsubmit = (event) => {
        // preventDefault() stops the browser's default behavior of
        // sending the form data and refreshing the page
        event.preventDefault();

        processFormSubmit(event);

        return false;
    }

    
    document.getElementById('filter-form').onsubmit = (event) => {
        // preventDefault() stops the browser's default behavior of
        // sending the form data and refreshing the page
        event.preventDefault();

        processFilterSubmit(event);

        return false;
    }
}

async function processFormSubmit(event) {
    const text = id('todo-item-text').value;
    id('todo-item-text').value = '';
    if (text !== '' && text !== 'clear') {
        let priority = id('todo-item-priority').value;
        console.log(`New item: ${text} ${priority}`);
        const data = {
            text: text,
            priority: priority
        };
        
        // Send the new data to the server and processing the response
        try {
            const res = await fetch('http://65.52.233.112/add_todont', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {"Content-Type": "application/json"}
            });
            
            console.log("POST /add_todont: response");
            console.log(res);
            if (res.redirected) {
                return window.location = res.url;
            }

            if (res.status === 403) {
                alert("You can't do that");
            } else if (res.status === 200) {
                local_items.push(data);
                render();
            }
        } catch (err) {
            console.log(err);
        }
     
        
    }
}

function render() {
    const template = id('todo-item-template');
    let list_elt = id('todo-list');
    list_elt.innerHTML = '';
    for (let i = 0; i < local_items.length; ++i) {
        let new_li = document.importNode(template.content, true);
        new_li.querySelector('.todo-item-text').textContent = local_items[i].text;
        new_li.querySelector('.todo-item-priority').textContent = local_items[i].priority;
        list_elt.appendChild(new_li);
    }
}

function getTodontItems () {
    fetch('http://65.52.233.112/todont_items', {
        method: 'GET'
    }).then( res => {
        console.log(res)
        return res.json();
    }).then( data => {
        // log the data
        console.log(data);
        // overwrite local_items with the array of todont items
        // recieved from the server
        local_items = data.todont_items;
        // render the list of items received from the server
        render();
    }).catch( err => {
        console.log(err);
    });
}

async function processFilterSubmit (event) {
    const priority = id('todo-filter-priority').value;
    if (priority === 'All') {
        getTodontItems();
    } else {
        filterTodontItems(priority);
    }
}

async function filterTodontItems (priority) {
    const res = await fetch(`http://65.52.233.112/todonts/${priority}`, {
        method: 'GET'
    });
    console.log(res)
    if (res.status === 200) {
        const data = await res.json();
        // log the data
        console.log(data);
        // overwrite local_items with the array of todont items
        // recieved from the server
        local_items = data.todont_items;
        // render the list of items received from the server
        render();
    } else {
        alert(`${res.status}: ${res.statusText}`);
    }
    
}
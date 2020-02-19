const express = require('express');
const app     = express();
const path    = require('path');

// Gives direct access to GET files from the
// "public" directory (you can name the directory anything)
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

// Default route
app.get('/', (req, res) => {
    console.log("GET [/]");
    let data = {
        query: req.query,
        body: req.body,
        params: req.params,
    };
    console.log(data);
    res.send(JSON.stringify(data));
});

app.post('/html/todont.html', (req, res) => {
    console.log("POST [/html/todont.html]");
    let data = {
        query: req.query,
        body: req.body,
        params: req.params,
    };
    console.log(data);
    res.send(JSON.stringify(data));
});

app.get("/todont_list", (req,res) => {
    res.sendFile(path.join(__dirname, '/public/html/todont.html'));
});

// Listen on port 80 (Default HTTP port)
app.listen(80, () => {
    console.log("Listening on port 80.");
});
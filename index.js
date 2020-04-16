const express        = require('express');
const app            = express();
const path           = require('path');
const createDAO      = require('./Models/dao');
const TodontModel    = require('./Models/TodontModel');
const UserModel      = require('./Models/UserModel');
const AuthController = require('./Controllers/AuthController');
const winston        = require('winston');
const redis          = require('redis');
const session        = require('express-session');
const RedisStore     = require('connect-redis')(session);
const UserController = require('./Controllers/UserController');

const redisClient = redis.createClient();

const sess = session({
    store: new RedisStore({ 
        client: redisClient, // our redis client
        host: 'localhost',   // redis is running locally on our VM (we don't want anyone accessing it)
        port: 6379,          // 6379 is the default redis port (you don't have to set this unless you change port)
        ttl: 12 * 60 * 60,   // Time-To-Live (in seconds) this will expire the session in 12 hours
    }),
    secret: 'astate web-dev', // Use a random string for this in production
    resave: false, 
    cookie: {
        httpOnly: true,
    },
    saveUninitialized: false, // set this to false so we can control when the cookie is set (i.e. when the user succesfully logs in)
});

// This parses the cookie from client's request
// it parse the cookie before any routes are handled or 
// application middleware kicks in
app.use(sess);

/*
        Initialize logger
*/
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json(),
    ),
    transports: [
      new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: './logs/info.log' })
    ]
});

const dbFilePath = process.env.DB_FILE_PATH || path.join(__dirname, 'Database', 'Todont.db');
let Todont = undefined;
let Auth   = undefined;

app.get("/dom", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/dom-ex.html'));
});

// Gives direct access to GET files from the
// "public" directory (you can name the directory anything)
app.use(express.static('public'));

// We add this to the middleware so it logs every request
// don't do this in production since it will log EVERYTHING (including passwords)
app.use((req, res, next) => {
    logger.info(`${req.ip}|${req.method}|${req.body || ""}|${req.originalUrl}`);
    next();
});

// We need this line so express can parse the POST data the browser
// automatically sends
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const badIPS = {};


app.get('/', (req, res, next) => {
    if (!req.session.name) {
        req.session.name  = req.query.name;
    }
    // req.session.views = req.session.views ? req.session.views+1 : 1;

    // console.log(`current views:`);
    // console.log(req.session);
    next();
});

app.use('*', (req, res, next) => {
    if (badIPS[req.ip] >= 10) {
        return res.sendStatus(403);
    }
    next();
});

app.all('/account/:username/*', async (req, res, next) => {
    const userID = await UserModel.getUserID(req.params.username);
    if (req.session.isVerified && userID === req.session.userID) {
        next();
    } else {
        // Rate limiting
        badIPS[req.ip] = badIPS[req.ip] ? badIPS[req.ip]+1 : 1;
        console.log(badIPS);
        res.sendStatus(403); // HTTP 403 Forbidden
    }
});

// All information associated with a user account
app.get('/account/:userID/info', (req, res) => {
    // TODO: retrieve account information and send back to client
    res.send('info')
});

app.post('/account/:userID/passwordReset', (req, res) => {
    // TODO: update password
    res.send('reset password')
});

app.post('/account/:userID/username', (req, res) => {
    // TODO: update username
    res.send('update username')
});

app.delete('/account/:userID/user', (req, res) => {
    // TODO: delete user from db
    res.send('delete user')
});

// Default route
app.get('/', (req, res) => {
    res.redirect('/todont_list');
});

app.get("/todont_list", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/todont.html'));
});

/*
        Getting Todont items
        all and filtering
*/
app.get("/todont_items", errorHandler(async (req, res) => {
    const rows = await Todont.getAll();
    res.send(JSON.stringify({todont_items: rows}));
}));

app.get("/todonts/:priority", errorHandler(async (req, res) => {
    const priority = req.params.priority;
    const validPriorities = ['Normal', 'Low', 'High'];
    if (!validPriorities.includes(priority)) {
        return res.sendStatus(400);
    }
    const rows = await Todont.getAllWithPriority(priority);
    res.send(JSON.stringify({todont_items: rows}));
}));

/*
        Adding todonts
*/
app.post("/add_todont", errorHandler( async (req, res) => {
    // This prevents adding new items unless you are authenticated
    // essentially it provides read-only access to the todont items
    // for unauthenticated users
    if (!req.session.isVerified) {
        return res.sendStatus(403);
    }
    const data = req.body;
    console.log(data);
    await Todont.add(data.text, data.priority);
    res.sendStatus(200);
}));

app.post("/logout", (req, res) => {
    req.session.isVerified = false;
    res.sendStatus(200);
})

/*
        Account Registration
*/
app.get("/register", errorHandler(async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "register.html"));
}));

app.post("/register", errorHandler(async (req, res) => {
    const body = req.body;
    if (body === undefined || (!body.username || !body.password)) {
        return res.sendStatus(400);
    }
    const {username, password} = body;
    try {
        await Auth.register(username, password);
        res.sendStatus(200);
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            console.error(err);
            logger.error(err);
            res.sendStatus(409); // 409 Conflict
        } else {
            throw err;
        }
    }
}));

/*
        User Login
*/
app.get("/login", errorHandler(async (req, res) => {
    if (req.session.isVerified) {
        res.redirect("/todont_list");
    } else {
        res.sendFile(path.join(__dirname, "public", "html", "login.html"));
    }
}));

app.post("/login", errorHandler( async (req, res) => {
    if (req.body === undefined || (!req.body.username || !req.body.password)) {
        return res.sendStatus(400);
    }
    const {username, password} = req.body;
    const isVerified = await Auth.login(username, password);
    const status = isVerified ? 200 : 401;
    req.session.isVerified = isVerified;
    // TODO: Set the user's ID on their session object
    if (isVerified) {
        req.session.username = username;
        req.session.uuid = await UserController.getUserID(username);
    }
    res.sendStatus(status);
}));

/*
        Error Pages
*/
// This sends back the error page
app.get('/error', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'error.html')));
// which hits this route to get a random error gif
app.get('/error_background', (req, res) => {
    const gifNum = Math.floor(Math.random() * 10) + 1;
    res.sendFile(path.join(__dirname, 'public', 'error_gifs', `error${gifNum}.gif`));
});



// Listen on port 80 (Default HTTP port)
app.listen(80, async () => {
    // wait until the db is initialized and all models are initialized
    await initDB();
    // Then log that the we're listening on port 80
    console.log("Listening on port 80.");
});

async function initDB () {
    const dao = await createDAO(dbFilePath);
    Todont = new TodontModel(dao);
    await Todont.createTable();
    Users = new UserModel(dao);
    await Users.createTable();
    Auth = new AuthController(dao);
}

// This is our default error handler (the error handler must be last)
// it just logs the call stack and send back status 500
app.use(function (err, req, res, next) {
    console.error(err.stack)
    logger.error(err);
    res.redirect('/error');
});

// We just use this to catch any error in our routes so they hit our default
// error handler. We only need to wrap async functions being used in routes
function errorHandler (fn) {
    return function(req, res, next) {
      return fn(req, res, next).catch(next);
    };
};
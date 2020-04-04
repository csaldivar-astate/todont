const sqlite3 = require('sqlite3');
const util    = require('util');

function createDB (dbFilePath) {
    // Promises are objects that take a function as its parameter
    // this function should take 2 parameters (resolve, reject)
    // which are functions themselves
    return new Promise ( (resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath, (err) => {
            if (err) {
                console.error(`Could not open ${dbFilePath}`);
                // Reject the promise if there is an error
                reject(err);
            }
        })
        // resolve the promise (i.e. keep the promise) if the db is 
        // created without error
        resolve(db);
    });
}


async function createDAO (dbFilePath) {
    const db = await createDB(dbFilePath);
    db.run = util.promisify(db.run);
    db.all = util.promisify(db.all);
    db.get = util.promisify(db.get);
    return db;
}

module.exports = createDAO;
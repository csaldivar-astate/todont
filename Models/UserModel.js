const uuidV4 = require('uuid').v4;

class UserModel {
    constructor (DAO) {
        this.DAO = DAO
    }
  
    async createTable () {
        const sql = `
            CREATE TABLE IF NOT EXISTS Users (
            uuid TEXT PRIMARY KEY,
            username TEXT UNIQUE,
            passwordHash TEXT
        )`
        return await this.DAO.run(sql)
    }
    
    async getUserID (username) {
        const sql = `SELECT uuid from Users WHERE username=?`;
        return await this.DAO.get(sql, [username]);
    }

    async getPasswordHash (username) {
        return await this.DAO.get(
            'select passwordHash from Users where username=?', 
            [username]
        );
    }

    async addUser (username, passwordHash) {
        const sql = `INSERT INTO Users (uuid, username, passwordHash) VALUES (?, ?, ?)`;
        // Username needs to be unique so this will throw an exception if we 
        // attempt to add a user that already exists
        const uuid = uuidV4();
        await this.DAO.run(sql, [uuid, username, passwordHash]);
    }
}

module.exports = UserModel;
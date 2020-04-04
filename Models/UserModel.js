class UserModel {
    constructor (DAO) {
        this.DAO = DAO
    }
  
    async createTable () {
        const sql = `
            CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            passwordHash TEXT
        )`
        return await this.DAO.run(sql)
    }

    async getPasswordHash (username) {
        return await this.DAO.get(
            'select passwordHash from Users where username=?', 
            [username]
        );
    }

    async addUser (username, passwordHash) {
        const sql = `INSERT INTO Users (username, passwordHash) VALUES (?, ?)`;
        // Username needs to be unique so this will throw an exception if we 
        // attempt to add a user that already exists
        await this.DAO.run(sql, [username, passwordHash]);
    }
}

module.exports = UserModel;
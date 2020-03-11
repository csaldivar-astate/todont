class TodontModel {
    constructor (DAO) {
        this.DAO = DAO
    }
  
    async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS todonts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT,
            priority TEXT
        )`
        return await this.DAO.run(sql)
    }

    async add (todont, priority) {
        return await this.DAO.run(
            'INSERT INTO todonts (text, priority) VALUES (?, ?)',
            [todont, priority]
        );
    }
    
    async getAll () {
        return await this.DAO.all(
            'SELECT text, priority FROM todonts'
        );
    }

    async getAllWithPriority (priority) {
        return await this.DAO.all(
            `SELECT text, priority FROM todonts WHERE priority=?`,
            [priority]
        );
    }
}
  
module.exports = TodontModel;
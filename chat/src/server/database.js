import sqlite3 from 'sqlite3';

export class DBModel{
    constructor(filepath) {
        this.db = new sqlite3.Database(filepath, (err) => {
            if (err) {
                console.error('Error creating database: ' + err.message);
            } else {
                this.initializeDatabase();
            }
        });
    }

    initializeDatabase() {
        this.db.run(`CREATE TABLE IF NOT EXISTS users (
            username TEXT NOT NULL UNIQUE, 
            password TEXT NOT NULL, 
            display_name TEXT NOT NULL, 
            status INTEGER NOT NULL, 
            PRIMARY KEY (username)
        )`, (err) => {
            if (err) {
                console.error('Error creating users table: ' + err.message);
            }
        });

        this.db.run(`CREATE TABLE IF NOT EXISTS chats (
            id TEXT NOT NULL, 
            chatname TEXT NOT NULL, 
            username TEXT NOT NULL,
            FOREIGN KEY (username) REFERENCES users(username),
            PRIMARY KEY (id, username)
        )`, (err) => {
            if (err) {
                console.error('Error creating chats table: ' + err.message);
            }
        });

        this.db.run(`CREATE TABLE IF NOT EXISTS messages (
            chat_id TEXT NOT NULL, 
            username TEXT NOT NULL, 
            timestamp TEXT NOT NULL, 
            content TEXT NOT NULL,
            FOREIGN KEY (chat_id, username) REFERENCES chats(id, username)
        )`, (err) => {
            if (err) {
                console.error('Error creating messages table: ' + err.message);
            }
        });
    }

    findUser(input, callback) {
        let sql = `SELECT * FROM users WHERE display_name LIKE '${input}%'`;
        this.db.all(sql, callback);
    }
    updateStatus(username, status, callback) {
        let sql = 'UPDATE users SET status = ? where username = ?';
        this.db.run(sql,[status, username], callback);
    }

    getUserStatus(username, callback) {
        const sql = `SELECT status FROM users WHERE username = ?`;
        this.db.get(sql, [username], callback);
    }
    
    getUser(username, password) {
        return new Promise((resolve, reject) => {
          const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
          this.db.get(query, [username, password], (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(row);
          });
        });
      }

    loadMessages(chat_id, offset, callback) {
        let sql = `SELECT m.chat_id, m.username, m.timestamp, m.content 
                    FROM messages AS m 
                    JOIN chats AS c ON m.chat_id = c.id AND m.username = c.username 
                    WHERE m.chat_id = ? 
                    ORDER BY m.timestamp DESC 
                    LIMIT 10 OFFSET ?`;
        this.db.all(sql, [chat_id, offset * 5], callback);
    }
    
    loadChats(username, callback) {
        let sql = 'SELECT * FROM chats WHERE username = ?';
        this.db.all(sql, [username], callback);
    }
    

    createChats(id, username, partners, callback){
        let sql = 'INSERT INTO chats (id, chatname, username) VALUES (?,?,?)';
        this.db.run(sql,[id, partners, username],callback);
        this.db.run(sql,[id, username, partners],callback);
    }

    insertData(chat_id, username, timestamp, content, callback) {
        let sql = 'INSERT INTO messages (chat_id, username, timestamp, content) VALUES (?,?,?,?)';
        this.db.run(sql,[chat_id, username, timestamp, content],callback)
    }
}
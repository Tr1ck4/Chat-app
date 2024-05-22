import sqlite3 from 'sqlite3';

export class DBModel{
    constructor(filepath) {
        this.db = new sqlite3.Database(filepath, (err) => { //initiate database path for running
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
                console.error('Error creating users table: ' + err.message);//handle possible violate constraint key
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
                console.error('Error creating chats table: ' + err.message);//handle case user is already in chat
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
        //in this demo, display_name is set to usernames in
        //the aim of using display_name is handle case where name of user can be the same or group chats have same name
        let sql = `SELECT * FROM users WHERE display_name LIKE '${input}%'`;
        this.db.all(sql, callback);
    }
    updateStatus(username, status, callback) {
        //switch status of user to active or offline
        let sql = 'UPDATE users SET status = ? where username = ?';
        this.db.run(sql,[status, username], callback);
    }

    getUserStatus(username, callback) {
        //retrieve user status
        const sql = `SELECT status FROM users WHERE username = ?`;
        this.db.get(sql, [username], callback);
    }
    
    getUser(username, password) {
        //check wheter username match the password
        //should throw error 'invalid username or password' to show to user in frontend
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

    loadMessages(chat_id, callback) {
        //load messages in corresponding chat channel
        console.log(chat_id);
        let sql = `SELECT m.chat_id, m.username, m.timestamp, m.content 
                    FROM messages AS m 
                    JOIN chats AS c ON m.chat_id = c.id AND m.username = c.username 
                    WHERE m.chat_id = ? 
                    ORDER BY m.timestamp DESC`;
        this.db.all(sql, [chat_id], callback);
    }
    
    loadChats(username, callback) {
        //load group chats for corresponding username
        let sql = 'SELECT * FROM chats WHERE username = ?';
        this.db.all(sql, [username], callback);
    }
    
    createUsers(username, password, callback) {
        //create a new account with default status is offline
        //user needs to login to be active
        let sql = 'INSERT INTO users (username ,password, display_name, status) VALUES (?, ?,?,?)';
        this.db.run(sql,[username,password,username,0],callback);
    }

    createChats(id, username, partners, callback){
        //create new group chat
        let sql = 'INSERT INTO chats (id, chatname, username) VALUES (?,?,?)';
        //create chats for both with same chat_id in case of partner create a chat to username
        this.db.run(sql,[id, partners, username],callback);
        this.db.run(sql,[id, username, partners],callback);
    }

    insertData(chat_id, username, timestamp, content, callback) {
        //insert messages from user to chat_id
        let sql = 'INSERT INTO messages (chat_id, username, timestamp, content) VALUES (?,?,?,?)';
        this.db.run(sql,[chat_id, username, timestamp, content],callback)
    }
}
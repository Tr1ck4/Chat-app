import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { DBModel } from './database.js';
import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import cors from 'cors'
const userModel = new DBModel('./database.db');

const app = express();
const server = createServer(app);
const io = new Server(server);
const __dirname = path.resolve(path.dirname(''));
const PORT = 3000;

const secretKey = 'TQEWE31824';//can store in database and call out
export const authenticateJWT = expressjwt({ secret: secretKey, algorithms: ['HS256'] });// user JWT tokenizer to hash the token
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));

function generateToken(user) {
    return jwt.sign(user, secretKey, { expiresIn: '1h' });//hash token
}

function authenticateToken(req, res, next) {
    const token = getTokenFromCookie(req);//get the cookie from header of http

    if (!token) {
        return res.sendStatus(401);//if there is no token then exit
    }

    jwt.verify(token, secretKey, (err, user) => {
        //verify token by revert into true token value
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

function getTokenFromCookie(req) {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
        return null;
    }
    //get the value of token value and access the data in it
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());

    const jwtCookie = cookies.find(cookie => cookie.startsWith('token='));

    if (!jwtCookie) {
        return null;
    }

    return jwtCookie.split('=')[1];
}
app.post('/api/register', async (req, res) => {  
    //the api use username and password as input data in body request
    const { username, password } = req.body;
    try {
        //access to create a new account
        userModel.createUsers(username, password, (err, result) => {
            if (err) { //handling error
                res.status(500).json({ error: err.message });
                return;
            }
            else{
                res.status(201).json({ message: 'User registered successfully' }); 
            }
        });        
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' }); 
    }
});


app.get('/api/authenticate', authenticateToken, (req, res) => {
    //use above function to authenticate token from user website
    const token = getTokenFromCookie(req);
    const userName = jwt.decode(token).username;
    const displayname = jwt.decode(token).accountname;
    res.json({ "username": userName, "accountname": displayname });
});

app.post('/api/logout', (req, res) => {
    //remove token from website so that authenticate cannot find the token
    res.setHeader('Set-cookie', `token=deleted; Max-Age=3600; HttpOnly`);
    res.json({ message: 'Logout successful' });
});

app.post('/api/login', async (req, res) => {
    //login step
    const { username, password } = req.body;
    const user = await userModel.getUser(username, password)
        .then(res => {
            return res;
        })
    if (!user) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
    }
    
    const token = generateToken({ username: user.username, accountname: user.display_name });//generate token
    res.setHeader('Set-cookie', `token=${token}; Max-Age=3600; HttpOnly`);//put cookie into header with time limit of 1h
    res.json({ message: 'Login successful' });
});

app.get('/api/groups/:username', authenticateToken, async (req, res) => {
    //retrieve all group chats of username in url params
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }
    try {
        userModel.loadChats(username, (err, rows) => { //user function in model to load chats
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        });
    } catch (error) {
        console.error('Error loading groups:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/groups/:chat_id/0', authenticateToken, async (req, res) => {
    //retrieve all messages data in the group
    const { chat_id } = req.params;
    try {
        userModel.loadMessages(chat_id, (err, messages) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(messages);
        });
    } catch (err) {
        console.log(err);
    }
});

app.get('/api/users/:input', authenticateToken, async (req, res) => {
    //find user for the group Modal input
    const { input } = req.params;
    try {
        userModel.findUser(input, (err, users) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(users);
        });
    } catch (err) {
        console.log(err);
    }
});

app.get('/api/status/:username', async (req, res) => {
    //retrieve status of input user, we can improve it by using authentication token
    //then access cookie and get the username not through calling direct username to secure data
    const { username } = req.params;
    userModel.getUserStatus(username, (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

io.on('connection', (socket) => {//start socket connection
    console.log('connect to sever')
    socket.on('connected', (username) => {
        //if user is in the homepage then update status of user to active
        socket.username = username; 
        userModel.updateStatus(socket.username, 1, (err) => {
            if (err) {
                console.log(err);
            }
        });
    });

    socket.on('join', (chat_id) => {
        //let user join the socket room through chat_id(uuid)
        socket.currentChatId = chat_id;
        socket.join(chat_id);
    });

    socket.on('create', (data) => {
        //instant call for creating groups
        const { id, username, partner } = data;
        userModel.createChats(id, username, partner, (err) => {
            if (err) {
                console.error('Error inserting message: ' + err.message);
                return;
            }
            io.emit('group created');//notice the frontend that group created
        });
    });

    socket.on('leave', (chat_id) => {//remove user from socket room(group chat)
        socket.leave(chat_id);
    });

    socket.on('chat message', (msg) => {//send message to socket room
        const { chat_id, username, content } = msg;
        const timestamp = new Date().toISOString();//get instant time for future notification
        userModel.insertData(chat_id, username, timestamp, content, (err) => {
            if (err) {
                console.error('Error inserting message: ' + err.message);
                return;
            }
            io.to(chat_id).emit('chat message', msg);
            //socket.broadcast.to(chat_id).emit('notification', 'New message received!');
        });
    });


    socket.on('disconnect', () => {//after close client, disconnect user from socket
        const username = socket.username;
        if (username) {
            userModel.updateStatus(username, 0, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    });
});



app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

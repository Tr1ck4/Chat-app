import express from 'express';
import { createServer } from 'http';
import {Server} from 'socket.io';
import path from 'path';
import {DBModel} from './database.js';
import jwt from 'jsonwebtoken';
import {expressjwt} from 'express-jwt';
import cors from 'cors';

const userModel = new DBModel('./database.db');

const app = express();
const server = createServer(app);
const io = new Server(server);
const __dirname = path.resolve(path.dirname(''));
const PORT = 3000;

const secretKey = 'TQEWE31824';
export const authenticateJWT = expressjwt({ secret: secretKey, algorithms: ['HS256'] });
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));

function generateToken(user) {
    return jwt.sign(user, secretKey, { expiresIn: '1h' });
}

function authenticateToken(req, res, next) {
    const token = getTokenFromCookie(req);

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, secretKey, (err, user) => {
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

    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());

    const jwtCookie = cookies.find(cookie => cookie.startsWith('token='));

    if (!jwtCookie) {
        return null;
    }

    return jwtCookie.split('=')[1];
}
app.get('/api/authenticate', authenticateToken, (req, res) => {
    const token = getTokenFromCookie(req);
    const userName = jwt.decode(token).username;
    const displayname = jwt.decode(token).accountname;
    res.json({ "username": userName, "accountname": displayname });
});

app.post('/api/logout', (req, res) => {
    // Clear the 'token' cookie by setting its expiration to a past date
    res.setHeader('Set-cookie', `token=deleted; Max-Age=3600; HttpOnly`);

    // Send a response indicating success
    res.json({ message: 'Logout successful' });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await userModel.getUser(username, password)
        .then(res => {
            return res;
        })
    if (!user) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
    }
    const token = generateToken({ username: user.username, accountname: user.display_name });
    res.setHeader('Set-cookie', `token=${token}; Max-Age=3600; HttpOnly`);
    res.json({ message: 'Login successful' });
});

app.get('/api/groups/:username', async (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }
    try {
        userModel.loadChats(username, (err, rows) => {
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

app.get('/api/groups/:chat_id/:offset', async (req, res) => {
    const {chat_id, offset} = req.params;
    try{
        userModel.loadMessages(chat_id, offset, (err, messages) => {
            if(err){
                res.status(500).json({error: err.message});
                return;
            }
            res.json(messages);
        })
    }catch (err) {
        console.log(err)
    }
})

app.get('/api/users/:input', async (req, res) => {
    const {input} = req.params;
    try{
        userModel.findUser(input, (err,users)=>{
            if(err) {
                res.status(500).json({error: err.message});
                return;
            }
            res.json(users);
        })
    }catch (err) {
        console.log(err);
    }
})


io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('join', (chat_id) => {
        socket.join(chat_id);
    });

    socket.on('leave', (chat_id) => {
        socket.leave(chat_id);
    });
    
    socket.on('chat message', (msg) => {
        const { chat_id, username, content } = msg;
        const timestamp = new Date().toISOString();
        userModel.insertData(chat_id, username, timestamp, content, (err) => {
            if (err) {
               console.error('Error inserting message: ' + err.message);
               return;
            }
            io.to(chat_id).emit('chat message', msg);
        });
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATA
});
  
db.connect((err) => {
    if (err) {
        console.error('Error connection to database');
    } else {
        console.log('Connected to database');
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        const { name, message } = msg;
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const queryString = `INSERT INTO messages (name, message, timestamp) VALUES (?, ?, ?)`;
        db.query(queryString, [name, message, timestamp], (err, result) => {
            if (err) throw err;
            console.log('Message saved to database');
        });

        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
});
const express = require('express');
const router = express.Router();

module.exports = router;

const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
});

const promisePool = pool.promise();

router.get('/', async function (req, res, next) {
    const [rows] = await promisePool.query("SELECT * FROM il05forum");
    res.render('index.njk', {
        rows: rows,
        title: 'Forum',
    });
});

router.get('/new', async function (req, res, next) {
    const [users] = await promisePool.query("SELECT * FROM il05users");
    res.render('new.njk', {
        title: 'Nytt inlägg',
        users,
    });
});

router.post('/new', async function (req, res, next) {
    const { author, title, content } = req.body;

    let user = await promisePool.query('SELECT * FROM il05users WHERE name = ?', [author]);
    if (!user) {
        user = await promisePool.query('INSERT INTO il05users (name) VALUES (?)', [author]);
    }

    const userId = user.insertId || user[0][0].id;
    const [rows] = await promisePool.query('INSERT INTO il05forum (authorId, title, content) VALUES (?, ?, ?)', [userId, title, content]);
    res.redirect('/'); // den här raden kan vara bra att kommentera ut för felsökning, du kan då använda tex. res.json({rows}) för att se vad som skickas tillbaka från databasen
});




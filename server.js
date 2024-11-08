const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(cors({
    origin: '*', // Adjust this to your needs in production
}));


const registerRoute = (method, route, handler) => {
    app[method](route, handler);
};


// Endpoint to check if a user exists
const readHelloMessage = (req, res) => {
    res.send('Hello from CS262 Team D!');
};


const readPlayers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM player');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving players');
    }
};

const readPlayer = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM player WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Player not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving player');
    }
};

const updatePlayer = async (req, res) => {
    const { id } = req.params;
    const { name, score } = req.body;
    try {
        const result = await pool.query(
            'UPDATE player SET name = $1, score = $2 WHERE id = $3 RETURNING *',
            [name, score, id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Player not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating player');
    }
};

const createPlayer = async (req, res) => {
    const { name, score } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO player (name, score) VALUES ($1, $2) RETURNING *',
            [name, score]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating player');
    }
};

const deletePlayer = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM player WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(204).send();
        } else {
            res.status(404).send('Player not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting player');
    }
};

registerRoute('get', '/', readHelloMessage);
registerRoute('get', '/players', readPlayers);
registerRoute('get', '/players/:id', readPlayer);
registerRoute('put', '/players/:id', updatePlayer);
registerRoute('post', '/players', createPlayer);
registerRoute('delete', '/players/:id', deletePlayer);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
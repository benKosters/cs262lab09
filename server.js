
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

// Endpoint to check if a user exists
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Route to fetch all players
app.get('/players', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM player');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving players');
    }
});

// Route to fetch a specific player by ID
app.get('/players/:id', async (req, res) => {
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
});

// Route to update a player by ID
app.put('/players/:id', async (req, res) => {
    const { id } = req.params;
    const { name, position } = req.body;
    try {
        const result = await pool.query(
            'UPDATE player SET name = $1, position = $2 WHERE id = $3 RETURNING *',
            [name, position, id]
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
});

// Route to create a new player
app.post('/players', async (req, res) => {
    const { name, position } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO player (name, position) VALUES ($1, $2) RETURNING *',
            [name, position]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating player');
    }
});

// Route to delete a player by ID
app.delete('/players/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM player WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.json({ message: 'Player deleted successfully' });
        } else {
            res.status(404).send('Player not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting player');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

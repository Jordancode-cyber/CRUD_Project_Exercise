const express = require('express');
const mysql = require('mysql2'); 
const app = express();
const PORT = 3000;


app.use(express.json());


const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '110022', 
    database: 'student'
});



db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database pool:', err.message);
        process.exit(1); 
    }
    console.log('Connected to the MySQL database pool successfully.');
    connection.release();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`); 
    });
});



// READ All (GET /users)
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            return res.status(500).json({ message: 'Error retrieving data', error: err.code });
        }
        res.json(results);
    });
});

// CREATE (POST /users)
app.post('/users', (req, res) => {
    const { first_name, last_name, email, phone, gender, age, course } = req.body;
    
    // Check for essential data before running the query
    if (!first_name || !email) {
        return res.status(400).json({ message: 'Missing required fields (first_name and email).' });
    }

    const sql = `INSERT INTO users(first_name, last_name, email, phone, gender, age, course) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [first_name, last_name, email, phone, gender, age, course], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ message: 'Error inserting data', error: err.code });
        }
        res.status(201).json({
            message: 'User created successfully',
            id: result.insertId
        });
    });
});



app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => { 
        if (err) {
            console.error('Error retrieving the required data:', err);
            return res.status(500).json({ message: 'Error retrieving data', error: err.code });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }
        res.json(results[0]);
    });
});


// UPDATE (PUT /users/:id)
app.put('/users/:id', (req, res) => {
    const userId= req.params.id; 
    const { first_name, last_name, email, phone, gender, age, course } = req.body;
    
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'No data provided for update.' });
    }

    const sql = `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, gender = ?, age = ?, course = ? WHERE id = ?`;
    db.query(sql, [first_name, last_name, email, phone, gender, age, course, userId], (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ message: 'Error updating data', error: err.code });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `User with ID ${userId} not found or no changes made.` });
        }

        res.json({ message: 'User updated successfully', rows_affected: result.affectedRows });
    });
});

// DELETE (DELETE /users/:id) 
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'DELETE FROM users WHERE id = ?';
    
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
            return res.status(500).json({ message: 'Error deleting data', error: err.code });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `User with ID ${userId} not found.` });
        }
        
        res.json({ message: 'User deleted successfully', rows_deleted: result.affectedRows });
    });
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); 
});

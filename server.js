const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123UnserPasswort!',
    database: 'bus'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Database connected!');
});

app.get('/', (req, res) => {
    res.send('Welcome to the Database Project!');
});

// Create a new person
app.post('/addPerson', (req, res) => {
    const person = req.body;

    // Log the person object to debug
    console.log('Person object received:', person);

    // Validate the input data
    if (!person.SVNR || !person.Vorname || !person.Nachname || !person.TelefonNr1 || !person.TelefonNr2 || !person.Straße || !person.Ort || !person.HausNr || !person.PLZ) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the SVNR already exists
    const checkSql = 'SELECT * FROM PERSON WHERE SVNR = ?';
    db.query(checkSql, [person.SVNR], (checkErr, checkResult) => {
        if (checkErr) {
            console.error('Error checking for existing person:', checkErr);
            res.status(500).json({ error: checkErr.message });
            return;
        }

        if (checkResult.length > 0) {
            res.status(409).json({ error: 'Person with this SVNR already exists' });
            return;
        }

        // If no duplicate found, proceed to insert
        const sql = 'INSERT INTO PERSON SET ?';
        db.query(sql, person, (err, result) => {
            if (err) {
                console.error('Error adding person:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Person added', SVNR: person.SVNR });
        });
    });
});


// Read all persons
app.get('/getPersons', (req, res) => {
    const sql = 'SELECT * FROM PERSON';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching persons:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Update a person
app.put('/updatePerson/:SVNR', (req, res) => {
    const { SVNR } = req.params;
    const updateData = req.body;
    const sql = 'UPDATE PERSON SET ? WHERE SVNR = ?';
    db.query(sql, [updateData, SVNR], (err, result) => {
        if (err) {
            console.error('Error updating person:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Person updated' });
    });
});

// Delete a person
app.delete('/deletePerson/:SVNR', (req, res) => {
    const { SVNR } = req.params;
    const sql = 'DELETE FROM PERSON WHERE SVNR = ?';
    db.query(sql, SVNR, (err, result) => {
        if (err) {
            console.error('Error deleting person:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Person deleted' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

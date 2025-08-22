const con = require('./db');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// login
app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const sql = "SELECT id, password FROM users WHERE username = ?";
    con.query(sql, [username], function(err, results) {
        if(err) {
            return res.status(500).send("Database server error");
        }
        if(results.length != 1) {
            return res.status(401).send("Wrong username");
        }
        // compare passwords
        bcrypt.compare(password, results[0].password, function(err, same) {
            if(err) {
                return res.status(500).send("Hashing error");
            }
            if(same) {

                return res.json({
                    message: "Login OK",
                    userId: results[0].id
                });
            }
            return res.status(401).send("Wrong password");
        });
    })
});

// Get all expenses for a user
app.get('/expenses/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = "SELECT id, items, paid, date FROM expense WHERE user_id = ?";
    con.query(sql, [userId], function(err, results) {
        if (err) {
            return res.status(500).send("Database server error");
        }
        return res.json(results);
    });
});

//  Today's expenses
app.get('/expenses/today/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT id, items, paid, date
        FROM expense
        WHERE user_id = ? AND DATE(date) = CURDATE()
    `;
    con.query(sql, [userId], function(err, results) {
        if (err) {
            return res.status(500).send("Database server error");
        }
        return res.json(results);
    });
});


// Feature Search
app.post('/expenses/search', (req, res) => {
    
})














// Feature Add
















// Feature Delete
















// ---------- Server starts here ---------
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});

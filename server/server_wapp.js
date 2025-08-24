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
    const {search} = req.body;
    const sql = "SELECT * FROM expense WHERE items LIKE ?";

    con.query(sql, [`%${search}%`], function(err, results) {
        console.log("Search results: ", results);
        if(err) {
            return res.status(500).send("Database server error");
        }
        res.json(results);
    });
});


// Feature Delete
app.delete('/expense/delete', (req,res)=>{
    const {expenseId} = req.body;
    if(!expenseId){
        return res.status(400).send('expenseID required');
    }
     //delete expense belongs to user
    const sqlDelete = "DELETE FROM expense WHERE id = ?";
    con.query(sqlDelete, [expenseId], function(err, result){
        if(err){return res.status(500).send("Database server error");}
        if(result.affectedRows === 0){
            return res.status(404).send("Expense not found");
        }
        res.status(200).send("Deleted!");
    })
})


// Feature Add
app.post('/expenses/add', (req, res) => {
    // 1. Get the userId from the request body along with items and paid
    const { items, paid, userId } = req.body;

    // 2. Update validation to include userId
    if (!items || !paid || !userId) {
        return res.status(400).send('Item, paid amount, and userId are required.');
    }
    if (isNaN(paid)) {
        return res.status(400).send('Paid amount must be a number.');
    }

    // 3. Update the SQL query to include the 'user_id' column
    //    Assuming your table's foreign key column is named 'user_id'
    const sql = "INSERT INTO expense (items, paid, user_id, date) VALUES (?, ?, ?, NOW())";

    // 4. Add userId to the array of values for the query
    con.query(sql, [items, paid, userId], function(err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send('Database server error.');
        }
        
        res.status(201).send(`Expense for user added successfully with ID: ${result.insertId}`);
    });
});

// Feature Delete
// ---------- Server starts here ---------
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});

const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'MainUser',
    password: 'CatPassword',
    database: 'cats_usersdb'
});
connection.connect(function (err) {
    if (err) throw err;
});

module.exports = (req, res, next) => {
    req.db = connection;
    next()
}
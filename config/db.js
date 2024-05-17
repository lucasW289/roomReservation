const mysql = require('mysql2');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'databaserrs',
    password: '',
    port: 3306
});



module.exports = con;
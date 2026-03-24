const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '192.168.178.71',  // oder deine Server-IP
    user: 'cedric',       // oder dein DB-Benutzer (z.B. 'cedric')
    password: '1234',
    database: 'church_Inv_Sql',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();

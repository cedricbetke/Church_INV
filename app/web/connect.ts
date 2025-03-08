// Installiere mysql2
import mysql from 'mysql2';

// Erstelle eine MySQL-Verbindung
const connection = mysql.createConnection({
    host: '192.168.178.155',  // Ersetze durch den Host deines MySQL-Servers
    user: 'cedric',       // Dein MySQL Benutzername
    password: '1234', // Dein MySQL Passwort
    database: 'church_Inv_Sql'  // Der Name der MySQL-Datenbank
});

// Funktion, um Daten abzurufen
const getItems = (): void => {
    connection.query(
        'SELECT * FROM geraete_View',
        (err, results, fields) => {
            if (err) {
                console.error('Fehler bei der Abfrage:', err);
            } else {
                console.log('Daten:', results);
            }
        }
    );
};

// Rufe die Daten ab
getItems();

// Schließe die Verbindung
connection.end();

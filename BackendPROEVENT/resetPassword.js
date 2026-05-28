const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'uapa_proevent'
});

db.query("UPDATE usuario SET contrasena='123456789' WHERE correo='rubelmanuelc@gmail.com'", (err, result) => {
  if (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  }
  console.log('Password updated, affected rows:', result.affectedRows);
  db.end();
});

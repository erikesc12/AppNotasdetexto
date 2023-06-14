const mysql = require('mysql');


const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database:'notasdetexto'
});

connection.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos: ', err);
      return;
    }
    console.log('Conexión exitosa a la base de datos');
  });
  
  connection.on('error', (err) => {
    console.error('Error en la conexión a la base de datos: ', err);
  });
  

  module.exports = connection;

  module.exports = {
    connection,
    createUserTable: 'QUERY_SQL_CREACION_USUARIOS',
    createNoteTable: 'QUERY_SQL_CREACION_NOTAS',
    createCategoryTable: 'QUERY_SQL_CREACION_CATEGORIAS'
  };

# AppNotasdetexto

Este repositorio contiene una aplicación de notas de texto con funcionalidades de registro, inicio de sesión, creación, modificación y visualización de notas, así como categorización de las mismas.

Instrucciones de uso

Para utilizar la aplicación, sigue los pasos a continuación:

Clona este repositorio en tu máquina local.

Asegúrate de tener Node.js instalado en tu sistema.

Abre una terminal y navega hasta el directorio raíz del proyecto.

Ejecuta el siguiente comando para instalar las dependencias:
npm install

Configura la conexión a la base de datos MySQL modificando el archivo index.js:
const conexion = db.createConnection({
  host: "localhost",
  database: "notasdetexto",
  user: "root",
  password: "1234",
});
Asegúrate de proporcionar la información correcta para la conexión a tu base de datos MySQL.

Inicia la aplicación ejecutando el siguiente comando:
node index.js

La aplicación estará disponible en http://localhost:3000.

Comentarios

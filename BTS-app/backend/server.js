// Importar las dependencias necesarias
const express = require('express'); // Framework para crear el servidor
const cors = require('cors'); // Middleware para habilitar CORS (Cross-Origin Resource Sharing)
const data = require('./db.json'); // Importar los datos de los miembros desde el archivo db.json

// Crear una instancia de la aplicación Express
const app = express();
// Definir el puerto en el que correrá el servidor
const port = 3001;

// Habilitar CORS para permitir que el frontend (en un origen diferente) se comunique con este backend
app.use(cors());

// Definir una ruta GET para obtener todos los miembros
app.get('/api/members', (req, res) => {
  // Enviar la lista completa de miembros como respuesta en formato JSON
  res.json(data.members);
});

// Definir una ruta GET para obtener un miembro específico por su ID
app.get('/api/members/:id', (req, res) => {
  // Buscar el miembro en la base de datos utilizando el ID proporcionado en la URL
  const member = data.members.find(m => m.id === parseInt(req.params.id));
  
  // Si se encuentra el miembro, enviarlo como respuesta
  if (member) {
    res.json(member);
  } else {
    // Si no se encuentra el miembro, enviar una respuesta de error 404 (No Encontrado)
    res.status(404).json({ message: 'Miembro no encontrado' });
  }
});

// Iniciar el servidor y hacer que escuche en el puerto especificado
app.listen(port, () => {
  // Imprimir un mensaje en la consola para confirmar que el servidor está funcionando
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
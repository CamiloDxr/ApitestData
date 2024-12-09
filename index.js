const jsonServer = require("json-server");
const express = require("express"); // Asegúrate de importar express
const server = jsonServer.create();
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const cors = require("cors");
const port = process.env.PORT || 10000;

// Middleware para procesar el cuerpo de las solicitudes
server.use(express.json()); // Procesa el cuerpo de las solicitudes como JSON

// Middleware para habilitar CORS
server.use(cors());

// Middleware para asegurarse de que solo los campos permitidos sean modificados
server.use((req, res, next) => {
  if (req.method === 'PUT' || req.method === 'PATCH') {
    console.log("Cuerpo de la solicitud:", req.body); // Verifica el contenido del cuerpo de la solicitud

    const body = req.body;
    const allowedFields = ['username', 'email', 'password'];
    const userId = body.id;

    // Verificar si el 'id' está presente en el cuerpo de la solicitud
    if (!userId) {
      return res.status(400).json({ error: "El 'id' del usuario es requerido" });
    }

    // Obtener datos existentes del usuario
    const existingUser = router.db.get('admin').find({ id: userId }).value();

    // Verificar si el usuario existe
    if (!existingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" }); // Si no se encuentra el usuario
    }

    // Preservamos el 'rut', 'role', y 'isactive' si no se proporcionan nuevos valores
    body.rut = existingUser.rut || body.rut;
    body.role = existingUser.role || body.role;
    body.isactive = existingUser.isactive || body.isactive;

    // Eliminar campos no permitidos
    for (let key in body) {
      if (!allowedFields.includes(key)) {
        delete body[key]; // Eliminar los campos que no sean 'username', 'email', 'password'
      }
    }

    // Actualizar los datos del usuario en la base de datos
    const updatedUser = router.db.get('admin').find({ id: userId }).assign(body).write();

    // Responder con el usuario actualizado
    console.log("Usuario actualizado:", updatedUser); // Verifica los datos actualizados
    res.status(200).json(updatedUser); // Retorna el usuario actualizado
  }
  next();
});

server.use(middlewares);
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});

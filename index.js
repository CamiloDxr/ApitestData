const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const cors = require("cors");
const port = process.env.PORT || 10000;

server.use(cors());

// Middleware para asegurarse de que solo los campos permitidos sean modificados
server.use((req, res, next) => {
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const body = req.body;
    const allowedFields = ['username', 'email', 'password'];
    const userId = body.id;

    // Agregar depuración para verificar los datos recibidos
    console.log("Datos recibidos para actualizar:", body);
    console.log("ID recibido:", userId);

    // Verificar si 'id' está presente en el cuerpo de la solicitud
    if (!userId) {
      return res.status(400).json({ error: "El 'id' del usuario es requerido" });
    }

    // Obtener datos existentes del usuario
    const existingUser = router.db.get('admin').find({ id: userId }).value();

    // Agregar depuración para verificar si el usuario existe
    console.log("Usuario encontrado:", existingUser);

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

    // Agregar depuración para verificar los datos actualizados
    console.log("Usuario actualizado:", updatedUser);

    // Responder con el usuario actualizado
    res.status(200).json(updatedUser); // Retorna el usuario actualizado
  }
  next();
});

server.use(middlewares);
server.use(router);
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});


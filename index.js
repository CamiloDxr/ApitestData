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

    // Si el cuerpo de la solicitud contiene datos sensibles, los eliminamos
    const allowedFields = ['username', 'email', 'password'];
    const userId = body.id;

    // Obtener datos existentes del usuario
    const existingUser = router.db.get('admin').find({ id: userId }).value();

    if (existingUser) {
      // Si no se incluyen estos campos, conservamos los valores existentes
      body.rut = existingUser.rut || body.rut; // Preservamos el 'rut'
      body.role = existingUser.role || body.role; // Preservamos el 'role'
      body.isactive = existingUser.isactive || body.isactive; // Preservamos el 'isactive'

      // Eliminar los campos no permitidos
      for (let key in body) {
        if (!allowedFields.includes(key)) {
          delete body[key]; // Eliminar los campos que no sean 'username', 'email', 'password'
        }
      }
    }
  }
  next();
});

server.use(middlewares);
server.use(router);
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});

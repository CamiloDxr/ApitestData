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

    // Asegurarse de que solo se actualicen los campos 'username', 'email' y 'password'
    const allowedFields = ['username', 'email', 'password'];
    
    // Filtra los campos que no están permitidos
    for (let key in body) {
      if (!allowedFields.includes(key)) {
        delete body[key]; // Elimina los campos no permitidos
      }
    }

    // Asegúrate de que el resto de los campos no sean modificados (por ejemplo, 'role', 'isactive', 'rut')
    const existingData = router.db.get('admin').find({ id: body.id }).value(); // Obtener datos existentes
    if (existingData) {
      // Si no se provee un campo, mantener el valor actual
      body.role = existingData.role || body.role;
      body.isactive = existingData.isactive || body.isactive;
      body.rut = existingData.rut || body.rut;
    }
  }
  next();
});

server.use(middlewares);
server.use(router);
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});

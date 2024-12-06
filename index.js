const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const cors = require("cors");
const port = process.env.PORT || 10000;

server.use(cors());

server.use((req, res, next) => {
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const body = req.body;

    if (body.hasOwnProperty('role')) {
      delete body.role; 
    }

    if (body.hasOwnProperty('isactive')) {
      delete body.isactive; 
    }
  }
  next();
});

server.use(middlewares);
server.use(router);
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});

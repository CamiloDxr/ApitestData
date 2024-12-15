const jsonServer = require("json-server");
const express = require("express");
const server = jsonServer.create();
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const cors = require("cors");
const port = process.env.PORT || 10000;

server.use(express.json());
server.use(cors());

// Aquí puedes agregar otras configuraciones y middlewares que ya tienes

// Ruta para verificar la inscripción de un usuario a un evento
server.get('/inscripciones/verify', (req, res) => {
  const { eventoId, usuarioId } = req.query;

  // Buscar el evento en la base de datos
  const evento = router.db.get('eventos').find({ id: eventoId }).value();

  if (!evento) {
    return res.status(404).json({ error: "Evento no encontrado" });
  }

  // Verificar si el usuario ya está registrado
  const yaInscrito = evento.usuariosRegistrados.includes(usuarioId);

  return res.status(200).json(yaInscrito);
});

// Ruta para inscribir un usuario a un evento
server.post('/inscripciones', (req, res) => {
  const { eventoId, usuarioId } = req.body;

  // Buscar el evento
  const evento = router.db.get('eventos').find({ id: eventoId }).value();

  if (!evento) {
    return res.status(404).json({ error: "Evento no encontrado" });
  }

  // Verificar si el usuario ya está inscrito
  if (evento.usuariosRegistrados.includes(usuarioId)) {
    return res.status(400).json({ error: "Usuario ya inscrito en el evento" });
  }

  // Inscribir al usuario
  evento.usuariosRegistrados.push(usuarioId);
  router.db.get('eventos').find({ id: eventoId }).assign(evento).write();

  return res.status(200).json({ success: "Usuario inscrito correctamente" });
});

// No olvides usar los middlewares y el router al final
server.use(middlewares);
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});

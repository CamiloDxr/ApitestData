const jsonServer = require("json-server");
const express = require("express"); // Asegúrate de importar express
const server = jsonServer.create();
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const cors = require("cors");
const nodemailer = require("nodemailer"); // Requiere Nodemailer
const port = process.env.PORT || 10000;

// Middleware para procesar el cuerpo de las solicitudes
server.use(express.json()); // Procesa el cuerpo de las solicitudes como JSON

// Middleware para habilitar CORS
server.use(cors());

// Middleware para asegurarse de que solo los campos permitidos sean modificados en usuarios
server.use((req, res, next) => {
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const body = req.body;
    const allowedFields = ['username', 'email', 'password'];
    const userId = body.id;

    // Verificar si el 'id' está presente en el cuerpo de la solicitud
    if (!userId) {
      return res.status(400).json({ error: "El 'id' del usuario es requerido" });
    }

    // Obtener datos existentes del usuario
    const existingUser = router.db.get('usuarios').find({ id: userId }).value();

    // Verificar si el usuario existe
    if (!existingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
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
    const updatedUser = router.db.get('usuarios').find({ id: userId }).assign(body).write();

    // Responder con el usuario actualizado
    res.status(200).json(updatedUser);
  }
  next();
});

// Middleware para actualizar los eventos
server.use((req, res, next) => {
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const body = req.body;
    const eventId = body.id;

    // Verificar si el 'id' está presente en el cuerpo de la solicitud
    if (!eventId) {
      return res.status(400).json({ error: "El 'id' del evento es requerido" });
    }

    // Obtener datos existentes del evento
    const existingEvent = router.db.get('eventos').find({ id: eventId }).value();

    // Verificar si el evento existe
    if (!existingEvent) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    // Preservar campos anteriores si no se proporcionan nuevos valores
    body.nombre = body.nombre || existingEvent.nombre;
    body.descripcion = body.descripcion || existingEvent.descripcion;
    body.fecha = body.fecha || existingEvent.fecha;
    body.ubicacion = body.ubicacion || existingEvent.ubicacion;
    body.cupos = body.cupos || existingEvent.cupos;
    body.imagen = body.imagen || existingEvent.imagen;

    // Actualizar los datos del evento en la base de datos
    const updatedEvent = router.db.get('eventos').find({ id: eventId }).assign(body).write();

    // Responder con el evento actualizado
    res.status(200).json(updatedEvent);
  }
  next();
});

// Configuración de Nodemailer para enviar el correo
const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes cambiar a otro servicio de correo si es necesario
  auth: {
    user: 'tu-correo@gmail.com', // Coloca tu correo aquí
    pass: 'tu-contraseña' // Coloca tu contraseña aquí (o utiliza un "App Password" si tienes activada la verificación en dos pasos)
  }
});

// Ruta para la recuperación de contraseña
server.post("/recover-password", (req, res) => {
  const { email, newPassword } = req.body;

  // Validar que el correo y la nueva contraseña estén presentes
  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email y nueva contraseña son requeridos" });
  }

  // Buscar al usuario por correo electrónico en la base de datos
  const user = router.db.get("usuarios").find({ email }).value();

  // Verificar si el usuario existe
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  // Actualizar la contraseña del usuario
  user.password = newPassword; // Cambia la contraseña
  router.db.get("usuarios").find({ email }).assign(user).write();

  // Enviar correo de confirmación
  const mailOptions = {
    from: 'tu-correo@gmail.com', // El correo de donde se enviará
    to: email, // El correo del destinatario
    subject: 'Recuperación de contraseña',
    text: `Hola ${user.username},\n\nTu contraseña ha sido cambiada con éxito. Si no solicitaste este cambio, por favor contáctanos inmediatamente.\n\nGracias,\nSoporte Técnico`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: "Error al enviar el correo: " + error });
    }
    console.log("Correo enviado: " + info.response);
  });

  // Retornar respuesta exitosa
  res.status(200).json({ message: "Contraseña actualizada con éxito y correo enviado." });
});

server.use(middlewares);
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});

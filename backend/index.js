const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");
const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🏆 API del Club Deportivo y Cultural Halcones funcionando");
});

// Ruta de login
app.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;

  const sql = "SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?";
  db.query(sql, [correo, contrasena], (err, result) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error en el servidor" });
    }
    if (result.length > 0) {
      const usuario = result[0];
      res.json({
        mensaje: "Login exitoso ✅",
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
      });
    } else {
      res.status(401).json({ mensaje: "Correo o contraseña incorrectos ❌" });
    }
  });
});
const atletasRoutes = require("./routes/atletas");
const pagosRoutes = require("./routes/pagos");
const asistenciaRoutes = require("./routes/asistencia");
const comunicadosRoutes = require("./routes/comunicados");

app.use("/atletas", atletasRoutes);
app.use("/pagos", pagosRoutes);
app.use("/asistencia", asistenciaRoutes);
app.use("/comunicados", comunicadosRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
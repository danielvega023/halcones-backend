const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Importar rutas
const atletasRoutes = require("./routes/atletas");
const pagosRoutes = require("./routes/pagos");
const asistenciaRoutes = require("./routes/asistencia");
const comunicadosRoutes = require("./routes/comunicados");
const disciplinasRoutes = require("./routes/disciplinas");
const gruposRoutes = require("./routes/grupos");
const usuariosRoutes = require("./routes/usuarios");
const reportesRoutes = require("./routes/reportes");

app.use("/atletas", atletasRoutes);
app.use("/pagos", pagosRoutes);
app.use("/asistencia", asistenciaRoutes);
app.use("/comunicados", comunicadosRoutes);
app.use("/disciplinas", disciplinasRoutes);
app.use("/grupos", gruposRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/reportes", reportesRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🏆 API del Club Deportivo y Cultural Halcones funcionando");
});

// Login
app.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;
  const sql = "SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?";
  db.query(sql, [correo, contrasena], (err, result) => {
    if (err) return res.status(500).json({ mensaje: "Error en el servidor" });
    if (result.length > 0) {
      const { id_usuario, nombre, rol } = result[0];
      res.json({ mensaje: "Login exitoso ✅", usuario: { id: id_usuario, nombre, rol } });
    } else {
      res.status(401).json({ mensaje: "Correo o contraseña incorrectos ❌" });
    }
  });
});

// Estadísticas dashboard
app.get("/estadisticas", (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM atletas) AS total_atletas,
      (SELECT COUNT(*) FROM atletas WHERE estado = 'activo') AS activos,
      (SELECT COUNT(*) FROM pagos WHERE estado = 'pendiente') AS pagos_pendientes,
      (SELECT COUNT(*) FROM pagos WHERE estado = 'aprobado') AS pagos_aprobados,
      (SELECT COUNT(*) FROM pagos WHERE estado = 'rechazado') AS pagos_rechazados,
      (SELECT COUNT(*) FROM disciplinas) AS total_disciplinas
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
});

// Estadísticas por disciplina (para gráficos)
app.get("/estadisticas/disciplinas", (req, res) => {
  const sql = `
    SELECT d.id_disciplina, d.nombre, d.icono, COUNT(a.id_atleta) AS total
    FROM disciplinas d
    LEFT JOIN atletas a ON d.id_disciplina = a.id_disciplina
    GROUP BY d.id_disciplina
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Endpoint para generar mensualidades automáticas (admin)
app.post("/generar-mensualidades", async (req, res) => {
  try {
    const [atletas] = await db.promise().query("SELECT id_atleta FROM atletas WHERE estado = 'activo'");
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const año = hoy.getFullYear();
    const monto = 800; // RD$800 mensualidad
    let generadas = 0;
    for (const a of atletas) {
      const [existe] = await db.promise().query(
        "SELECT id_pago FROM pagos WHERE id_atleta = ? AND tipo_pago = 'mensualidad' AND MONTH(fecha_pago) = ? AND YEAR(fecha_pago) = ?",
        [a.id_atleta, mes, año]
      );
      if (existe.length === 0) {
        await db.promise().query(
          "INSERT INTO pagos (id_atleta, tipo_pago, monto, fecha_pago, metodo_pago, estado) VALUES (?, 'mensualidad', ?, CURDATE(), 'pendiente', 'pendiente')",
          [a.id_atleta, monto]
        );
        generadas++;
      }
    }
    res.json({ mensaje: `Se generaron ${generadas} mensualidades para atletas activos` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
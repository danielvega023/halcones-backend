const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Obtener asistencia de un grupo en una fecha
router.get("/grupo/:id_grupo", (req, res) => {
  const { fecha } = req.query;
  const sql = `
    SELECT a.id_asistencia, at.nombre, at.apellido, a.estado, a.observacion, a.fecha
    FROM asistencias a
    JOIN atletas at ON a.id_atleta = at.id_atleta
    WHERE a.id_grupo = ? AND a.fecha = ?
  `;
  db.query(sql, [req.params.id_grupo, fecha], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Obtener atletas de un grupo (para marcar asistencia)
router.get("/grupo/:id_grupo/atletas", (req, res) => {
  const sql = `SELECT id_atleta, nombre, apellido FROM atletas WHERE id_grupo = ? AND estado = 'activo'`;
  db.query(sql, [req.params.id_grupo], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Registrar asistencia múltiple
router.post("/", (req, res) => {
  const { registros } = req.body;
  if (!registros || !registros.length) return res.status(400).json({ error: "No hay registros" });
  const sql = `INSERT INTO asistencias (id_atleta, id_grupo, fecha, estado, observacion) VALUES ?`;
  const valores = registros.map(r => [r.id_atleta, r.id_grupo, r.fecha, r.estado, r.observacion || null]);
  db.query(sql, [valores], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Asistencia registrada correctamente" });
  });
});

// Historial de asistencia de un atleta
router.get("/atleta/:id_atleta", (req, res) => {
  const sql = "SELECT * FROM asistencias WHERE id_atleta = ? ORDER BY fecha DESC";
  db.query(sql, [req.params.id_atleta], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
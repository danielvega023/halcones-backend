const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM comunicados ORDER BY fecha_publicacion DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.post("/", (req, res) => {
  const { titulo, mensaje, destinatario, prioridad } = req.body;
  const sql = `INSERT INTO comunicados (titulo, mensaje, destinatario, prioridad) VALUES (?, ?, ?, ?)`;
  db.query(sql, [titulo, mensaje, destinatario, prioridad || "normal"], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Comunicado publicado correctamente", id: result.insertId });
  });
});

module.exports = router;
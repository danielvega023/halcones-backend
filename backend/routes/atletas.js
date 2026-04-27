const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ CREATE — Registrar nuevo atleta
router.post("/", (req, res) => {
  const { nombre, apellido, fecha_nacimiento, id_disciplina, id_tutor, id_grupo } = req.body;
  const sql = `
    INSERT INTO atletas (nombre, apellido, fecha_nacimiento, id_disciplina, id_tutor, id_grupo, estado)
    VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
  `;
  db.query(sql, [nombre, apellido, fecha_nacimiento, id_disciplina, id_tutor, id_grupo], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ mensaje: "Atleta registrado exitosamente ✅", id: result.insertId });
  });
});

// ✅ READ — Obtener todos los atletas
router.get("/", (req, res) => {
  const sql = `
    SELECT a.id_atleta, a.nombre, a.apellido, a.fecha_nacimiento,
           a.estado, d.nombre AS disciplina, g.nombre AS grupo,
           u.nombre AS tutor
    FROM atletas a
    LEFT JOIN disciplinas d ON a.id_disciplina = d.id_disciplina
    LEFT JOIN grupos g ON a.id_grupo = g.id_grupo
    LEFT JOIN usuarios u ON a.id_tutor = u.id_usuario
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// ✅ READ — Obtener un atleta por ID
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM atletas WHERE id_atleta = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ mensaje: "Atleta no encontrado ❌" });
    res.json(result[0]);
  });
});

// ✅ UPDATE — Actualizar datos de un atleta
router.put("/:id", (req, res) => {
  const { nombre, apellido, fecha_nacimiento, id_disciplina, id_grupo } = req.body;
  const sql = `
    UPDATE atletas
    SET nombre = ?, apellido = ?, fecha_nacimiento = ?, id_disciplina = ?, id_grupo = ?
    WHERE id_atleta = ?
  `;
  db.query(sql, [nombre, apellido, fecha_nacimiento, id_disciplina, id_grupo, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Atleta actualizado correctamente ✅" });
  });
});

// ✅ UPDATE — Cambiar estado del atleta (aprobar/rechazar)
router.put("/:id/estado", (req, res) => {
  const { estado } = req.body;
  const sql = "UPDATE atletas SET estado = ? WHERE id_atleta = ?";
  db.query(sql, [estado, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: `Estado actualizado a '${estado}' ✅` });
  });
});

// ✅ DELETE — Eliminar un atleta
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM atletas WHERE id_atleta = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: "Atleta no encontrado ❌" });
    res.json({ mensaje: "Atleta eliminado correctamente 🗑️" });
  });
});

module.exports = router;
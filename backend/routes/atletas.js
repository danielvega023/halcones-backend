const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = `
    SELECT a.*, u.nombre AS nombre_tutor, u.correo AS correo_tutor,
           d.nombre AS disciplina, g.nombre AS grupo
    FROM atletas a
    LEFT JOIN usuarios u ON a.id_tutor = u.id_usuario
    LEFT JOIN disciplinas d ON a.id_disciplina = d.id_disciplina
    LEFT JOIN grupos g ON a.id_grupo = g.id_grupo
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.post("/", (req, res) => {
  const { nombre, apellido, fecha_nacimiento, id_disciplina, id_tutor, id_grupo } = req.body;
  const sql = `
    INSERT INTO atletas (nombre, apellido, fecha_nacimiento, id_disciplina, id_tutor, id_grupo, estado)
    VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
  `;
  db.query(sql, [nombre, apellido, fecha_nacimiento, id_disciplina, id_tutor, id_grupo], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Atleta registrado, pendiente de aprobación", id: result.insertId });
  });
});

router.put("/:id/estado", (req, res) => {
  const { estado } = req.body;
  const sql = "UPDATE atletas SET estado = ? WHERE id_atleta = ?";
  db.query(sql, [estado, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: `Atleta ${estado} correctamente` });
  });
});

module.exports = router;
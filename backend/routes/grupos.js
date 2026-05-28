const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT g.*, d.nombre AS disciplina_nombre, u.nombre AS entrenador_nombre
      FROM grupos g
      LEFT JOIN disciplinas d ON g.id_disciplina = d.id_disciplina
      LEFT JOIN usuarios u ON g.id_entrenador = u.id_usuario
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  const { nombre, id_disciplina, id_entrenador, horario, nivel } = req.body;
  try {
    const [result] = await db.promise().query(
      "INSERT INTO grupos (nombre, id_disciplina, id_entrenador, horario, nivel) VALUES (?, ?, ?, ?, ?)",
      [nombre, id_disciplina, id_entrenador || null, horario || null, nivel || null]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Grupo creado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  const { nombre, id_disciplina, id_entrenador, horario, nivel } = req.body;
  try {
    await db.promise().query(
      "UPDATE grupos SET nombre=?, id_disciplina=?, id_entrenador=?, horario=?, nivel=? WHERE id_grupo=?",
      [nombre, id_disciplina, id_entrenador, horario, nivel, req.params.id]
    );
    res.json({ mensaje: "Grupo actualizado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.promise().query("DELETE FROM grupos WHERE id_grupo = ?", [req.params.id]);
    res.json({ mensaje: "Grupo eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
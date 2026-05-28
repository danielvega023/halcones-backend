const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM disciplinas");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  const { nombre, descripcion, icono } = req.body;
  try {
    const [result] = await db.promise().query(
      "INSERT INTO disciplinas (nombre, descripcion, icono) VALUES (?, ?, ?)",
      [nombre, descripcion || null, icono || null]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Disciplina creada" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  const { nombre, descripcion, icono } = req.body;
  try {
    await db.promise().query(
      "UPDATE disciplinas SET nombre=?, descripcion=?, icono=? WHERE id_disciplina=?",
      [nombre, descripcion, icono, req.params.id]
    );
    res.json({ mensaje: "Disciplina actualizada" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.promise().query("DELETE FROM disciplinas WHERE id_disciplina = ?", [req.params.id]);
    res.json({ mensaje: "Disciplina eliminada" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Crear o buscar tutor por email
router.post("/tutor", async (req, res) => {
  const { nombre, apellido, correo, telefono } = req.body;
  if (!correo) return res.status(400).json({ error: "Correo requerido" });
  try {
    const [existing] = await db.promise().query("SELECT id_usuario FROM usuarios WHERE correo = ?", [correo]);
    if (existing.length > 0) {
      return res.json({ id: existing[0].id_usuario, mensaje: "Tutor ya existente" });
    }
    const [result] = await db.promise().query(
      "INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol, telefono) VALUES (?, ?, ?, ?, 'tutor', ?)",
      [nombre || "", apellido || "", correo, "temporal123", telefono || null]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Tutor creado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todos los entrenadores
router.get("/entrenadores", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT id_usuario, nombre, apellido FROM usuarios WHERE rol = 'entrenador'");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
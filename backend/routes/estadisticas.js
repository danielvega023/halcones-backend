const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Estadísticas generales
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM atletas) AS total_atletas,
      (SELECT COUNT(*) FROM atletas WHERE estado = 'activo') AS activos,
      (SELECT COUNT(*) FROM atletas WHERE estado = 'inactivo') AS inactivos,
      (SELECT COUNT(*) FROM atletas WHERE estado = 'pendiente') AS pendientes,
      (SELECT COUNT(*) FROM pagos WHERE estado = 'pendiente') AS pagos_pendientes,
      (SELECT COUNT(*) FROM pagos WHERE estado = 'aprobado') AS pagos_aprobados,
      (SELECT COUNT(*) FROM pagos WHERE estado = 'rechazado') AS pagos_rechazados,
      (SELECT COUNT(*) FROM disciplinas) AS total_disciplinas,
      (SELECT COUNT(*) FROM usuarios WHERE rol = 'entrenador') AS entrenadores
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
});

// Atletas por disciplina (para gráfico de barras)
router.get("/disciplinas", (req, res) => {
  const sql = `
    SELECT d.id_disciplina, d.nombre, d.icono, COUNT(a.id_atleta) AS total
    FROM disciplinas d
    LEFT JOIN atletas a ON d.id_disciplina = a.id_disciplina
    GROUP BY d.id_disciplina
    ORDER BY total DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Resumen de pagos por disciplina (opcional para dashboard)
router.get("/pagos", (req, res) => {
  const sql = `
    SELECT d.nombre, 
      SUM(CASE WHEN p.estado = 'aprobado' THEN 1 ELSE 0 END) AS pagos_ok,
      SUM(CASE WHEN p.estado = 'pendiente' THEN 1 ELSE 0 END) AS pagos_pend,
      SUM(CASE WHEN p.estado = 'rechazado' THEN 1 ELSE 0 END) AS pagos_rech
    FROM disciplinas d
    LEFT JOIN atletas a ON d.id_disciplina = a.id_disciplina
    LEFT JOIN pagos p ON a.id_atleta = p.id_atleta
    GROUP BY d.id_disciplina
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Tendencia de inscripciones por mes (basado en fecha_ingreso de atletas)
router.get("/tendencias", (req, res) => {
  const sql = `
    SELECT DATE_FORMAT(fecha_ingreso, '%Y-%m') AS mes, COUNT(*) AS total
    FROM atletas
    WHERE fecha_ingreso IS NOT NULL
    GROUP BY mes
    ORDER BY mes DESC
    LIMIT 12
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    // Formatear para el gráfico: meses en orden ascendente
    const data = result.reverse();
    res.json(data);
  });
});

module.exports = router;
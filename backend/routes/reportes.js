const express = require("express");
const router = express.Router();
const db = require("../config/db");
const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");

// Reporte de morosidad (JSON)
router.get("/morosidad", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT a.id_atleta, a.nombre, a.apellido, d.nombre AS disciplina,
             (SELECT COUNT(*) FROM pagos WHERE id_atleta = a.id_atleta AND estado = 'pendiente') AS pagos_pendientes
      FROM atletas a
      JOIN disciplinas d ON a.id_disciplina = d.id_disciplina
      WHERE a.estado = 'activo'
      HAVING pagos_pendientes > 0
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reporte de asistencia por grupo y rango de fechas (JSON)
router.get("/asistencia", async (req, res) => {
  const { id_grupo, fecha_inicio, fecha_fin } = req.query;
  if (!id_grupo || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }
  try {
    const [rows] = await db.promise().query(`
      SELECT a.nombre, a.apellido, asis.fecha, asis.estado, asis.observacion
      FROM asistencias asis
      JOIN atletas a ON asis.id_atleta = a.id_atleta
      WHERE asis.id_grupo = ? AND asis.fecha BETWEEN ? AND ?
      ORDER BY a.nombre, asis.fecha
    `, [id_grupo, fecha_inicio, fecha_fin]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Exportar morosidad a PDF
router.get("/morosidad/pdf", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT a.nombre, a.apellido, d.nombre AS disciplina,
             (SELECT COUNT(*) FROM pagos WHERE id_atleta = a.id_atleta AND estado = 'pendiente') AS pendientes
      FROM atletas a JOIN disciplinas d ON a.id_disciplina = d.id_disciplina
      WHERE a.estado = 'activo' HAVING pendientes > 0
    `);
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=morosidad.pdf");
    doc.pipe(res);
    doc.fontSize(18).text("Reporte de Morosidad - Club Halcones", { align: "center" });
    doc.moveDown();
    rows.forEach((row, i) => {
      doc.fontSize(12).text(`${i+1}. ${row.nombre} ${row.apellido} - ${row.disciplina} - Pagos pendientes: ${row.pendientes}`);
      doc.moveDown(0.5);
    });
    doc.end();
  } catch (err) {
    res.status(500).send("Error al generar PDF");
  }
});

// Exportar asistencia a Excel
router.get("/asistencia/excel", async (req, res) => {
  const { id_grupo, fecha_inicio, fecha_fin } = req.query;
  if (!id_grupo || !fecha_inicio || !fecha_fin) return res.status(400).send("Faltan parámetros");
  try {
    const [rows] = await db.promise().query(`
      SELECT a.nombre, a.apellido, asis.fecha, asis.estado, asis.observacion
      FROM asistencias asis JOIN atletas a ON asis.id_atleta = a.id_atleta
      WHERE asis.id_grupo = ? AND asis.fecha BETWEEN ? AND ?
    `, [id_grupo, fecha_inicio, fecha_fin]);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=asistencia.xlsx");
    res.send(buffer);
  } catch (err) {
    res.status(500).send("Error al generar Excel");
  }
});

module.exports = router;
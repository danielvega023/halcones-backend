const express = require("express");
const router = express.Router();
const db = require("../config/db");
const upload = require("../middleware/upload");
const path = require("path");

// CREATE (efectivo o transferencia sin archivo)
router.post("/", (req, res) => {
  const { id_atleta, tipo_pago, monto, metodo_pago, comprobante } = req.body;
  const estado = metodo_pago === "transferencia" ? "pendiente" : "aprobado";
  const sql = `INSERT INTO pagos (id_atleta, tipo_pago, monto, fecha_pago, metodo_pago, estado, comprobante)
               VALUES (?, ?, ?, CURDATE(), ?, ?, ?)`;
  db.query(sql, [id_atleta, tipo_pago, monto, metodo_pago, estado, comprobante || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ mensaje: "Pago registrado exitosamente ✅", estado, id: result.insertId });
  });
});

// CREATE con comprobante (archivo)
router.post("/con-comprobante", upload.single("comprobante"), async (req, res) => {
  const { id_atleta, tipo_pago, monto, metodo_pago } = req.body;
  if (!req.file) return res.status(400).json({ error: "Debe subir un archivo" });
  const comprobantePath = `/uploads/${req.file.filename}`;
  const estado = "pendiente";
  try {
    const [result] = await db.promise().query(
      `INSERT INTO pagos (id_atleta, tipo_pago, monto, fecha_pago, metodo_pago, estado, comprobante)
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?)`,
      [id_atleta, tipo_pago, monto, metodo_pago, estado, comprobantePath]
    );
    res.status(201).json({ id: result.insertId, estado, mensaje: "Pago registrado, pendiente de aprobación" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ todos
router.get("/", (req, res) => {
  const sql = `
    SELECT p.*, a.nombre AS nombre_atleta, a.apellido AS apellido_atleta
    FROM pagos p
    JOIN atletas a ON p.id_atleta = a.id_atleta
    ORDER BY p.fecha_pago DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// READ por atleta
router.get("/:id_atleta", (req, res) => {
  const sql = `SELECT * FROM pagos WHERE id_atleta = ? ORDER BY fecha_pago DESC`;
  db.query(sql, [req.params.id_atleta], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// UPDATE datos
router.put("/:id", (req, res) => {
  const { tipo_pago, monto, metodo_pago } = req.body;
  const sql = `UPDATE pagos SET tipo_pago = ?, monto = ?, metodo_pago = ? WHERE id_pago = ?`;
  db.query(sql, [tipo_pago, monto, metodo_pago, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Pago actualizado correctamente ✅" });
  });
});

// UPDATE estado (aprobar/rechazar)
router.put("/:id/estado", (req, res) => {
  const { estado, motivo_rechazo } = req.body;
  const sql = `UPDATE pagos SET estado = ?, motivo_rechazo = ? WHERE id_pago = ?`;
  db.query(sql, [estado, motivo_rechazo || null, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: `Pago ${estado} correctamente ✅` });
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  const sql = `DELETE FROM pagos WHERE id_pago = ?`;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: "Pago no encontrado ❌" });
    res.json({ mensaje: "Pago eliminado correctamente 🗑️" });
  });
});

// Servir archivos estáticos de comprobantes
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;
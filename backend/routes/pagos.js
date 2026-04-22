const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:id_atleta", (req, res) => {
  const sql = "SELECT * FROM pagos WHERE id_atleta = ? ORDER BY fecha_pago DESC";
  db.query(sql, [req.params.id_atleta], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.post("/", (req, res) => {
  const { id_atleta, tipo_pago, monto, metodo_pago, comprobante } = req.body;
  const estado = metodo_pago === "transferencia" ? "pendiente" : "aprobado";
  const sql = `
    INSERT INTO pagos (id_atleta, tipo_pago, monto, fecha_pago, metodo_pago, estado, comprobante)
    VALUES (?, ?, ?, CURDATE(), ?, ?, ?)
  `;
  db.query(sql, [id_atleta, tipo_pago, monto, metodo_pago, estado, comprobante || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Pago registrado", estado, id: result.insertId });
  });
});

router.put("/:id/estado", (req, res) => {
  const { estado, motivo_rechazo } = req.body;
  const sql = "UPDATE pagos SET estado = ?, motivo_rechazo = ? WHERE id_pago = ?";
  db.query(sql, [estado, motivo_rechazo || null, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: `Pago ${estado} correctamente` });
  });
});

module.exports = router;
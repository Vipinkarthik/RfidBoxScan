const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  tag: { type: String, required: true },
  status: { type: String, default: 'Scanned' },
  timestamp: { type: Date, required: true },
  section: { type: String, required: true }, // Warehouse, Packaging, Finished, Dispatched
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);

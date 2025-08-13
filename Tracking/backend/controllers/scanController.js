const Scan = require('../models/Scan');

exports.createScan = async (req, res) => {
  try {
    let { tag, status, timestamp, section } = req.body;
    // Parse timestamp to Date, fallback to now if invalid
    let parsedTimestamp = new Date(timestamp);
    if (isNaN(parsedTimestamp.getTime())) {
      parsedTimestamp = new Date();
    }
    const scan = new Scan({ tag, status, timestamp: parsedTimestamp, section });
    await scan.save();
    res.status(201).json({ message: 'Scan entry saved', scan });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getScans = async (req, res) => {
  try {
    const scans = await Scan.find().sort({ timestamp: -1 });
    res.json(scans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

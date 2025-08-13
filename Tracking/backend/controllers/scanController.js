const Scan = require('../models/Scan');

exports.createScan = async (req, res) => {
  try {
    let { tag, box, status, timestamp, section, time } = req.body;

    // If box is missing, assign 'Unknown'
    if (!box) box = 'Unknown';
    // If tag is missing, assign 'N/A'
    if (!tag) tag = 'N/A';
    // Default status to 'Scanned' if not provided
    if (!status) status = 'Scanned';

    // Handle timestamp parsing - support both Unix timestamp and ISO string
    let parsedTimestamp;
    if (timestamp) {
      // If timestamp is a number (Unix timestamp)
      if (typeof timestamp === 'number' || !isNaN(Number(timestamp))) {
        let ts = Number(timestamp);
        // Convert to milliseconds if it's in seconds
        if (ts < 1000000000000) ts *= 1000;
        parsedTimestamp = new Date(ts);
      } else {
        // Try to parse as ISO string
        parsedTimestamp = new Date(timestamp);
      }
    }

    // If timestamp parsing failed or not provided, use current time
    if (!parsedTimestamp || isNaN(parsedTimestamp.getTime())) {
      parsedTimestamp = new Date();
    }

    // Store the time string if provided (for display purposes)
    const scanData = {
      tag,
      box,
      status,
      timestamp: parsedTimestamp,
      section,
      time: time || parsedTimestamp.toLocaleTimeString()
    };

    const scan = new Scan(scanData);
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

exports.getSectionCounts = async (req, res) => {
  try {
    const scans = await Scan.find();

    const sectionCounts = {
      warehouse: 0,
      packaging: 0,
      finishing: 0,
      dispatch: 0,
      total: 0
    };

    scans.forEach(scan => {
      const section = scan.section?.toLowerCase();
      if (section === 'warehouse') sectionCounts.warehouse++;
      else if (section === 'packaging') sectionCounts.packaging++;
      else if (section === 'finishing') sectionCounts.finishing++;
      else if (section === 'dispatch') sectionCounts.dispatch++;
    });

    sectionCounts.total = sectionCounts.warehouse + sectionCounts.packaging + sectionCounts.finishing + sectionCounts.dispatch;

    res.json(sectionCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

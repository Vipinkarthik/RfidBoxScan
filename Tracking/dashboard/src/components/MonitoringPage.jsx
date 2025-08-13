import React, { useEffect, useState } from 'react';
import { RefreshCw, Tag, Clock, Database, AlertCircle, MapPin } from 'lucide-react';

const FIREBASE_URL = 'https://rfidscanner-52fdb-default-rtdb.asia-southeast1.firebasedatabase.app/rfid.json';

const MonitoringPage = () => {
  const [scanData, setScanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionInputs, setSectionInputs] = useState({});
  const [submitStatus, setSubmitStatus] = useState({});

  useEffect(() => {
  let interval;
  const fetchData = async () => {
    try {
      const res = await fetch(FIREBASE_URL);
      const data = await res.json();

      let newData = [];
      if (Array.isArray(data)) {
        newData = data;
      } else if (data && typeof data === 'object') {
        newData = Object.values(data);
      }

      // Only update if data length changes or a new tag is detected
      setScanData(prev => {
        const prevIds = prev.map(s => s.tagId || s.boxId || s.rfid || s.id);
        const newIds = newData.map(s => s.tagId || s.boxId || s.rfid || s.id);
        const isDifferent = newIds.some(id => !prevIds.includes(id)) || newData.length !== prev.length;
        return isDifferent ? newData : prev;
      });

      if (loading) setLoading(false);
    } catch (err) {
      setError('Failed to fetch live scan data');
      if (loading) setLoading(false);
    }
  };

  fetchData();
  interval = setInterval(fetchData, 2000);
  return () => clearInterval(interval);
}, [loading]);


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-amber-100 flex flex-col items-center py-8">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            RFID Live Monitoring
          </h1>
          <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
        </div>
        <p className="text-gray-600 mb-4">Live updates from RFID scans will appear below. Scans are fetched directly from Firebase in real time.</p>
        {loading && <div className="text-center text-blue-600">Loading scans...</div>}
        {error && <div className="text-center text-red-600 flex items-center gap-2"><AlertCircle />{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 text-left">Tag ID <Tag className="inline w-4 h-4 text-blue-500" /></th>
                  <th className="px-4 py-2 text-left">Timestamp <Clock className="inline w-4 h-4 text-amber-500" /></th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {scanData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-400">No scans yet.</td>
                  </tr>
                ) : (
                  scanData.map((scan, idx) => {
                    // Support both tagId and boxId, and show readable time
                    const tag = scan.tagId || scan.boxId || scan.rfid || scan.id || 'N/A';
                    let timeString = 'N/A';
                    let timestamp = null;
                    if (scan.timestamp) {
                      let ts = scan.timestamp;
                      if (typeof ts === 'string') ts = Number(ts);
                      if (ts < 1000000000000) ts = ts * 1000;
                      timeString = new Date(ts).toLocaleString();
                      timestamp = new Date(ts).toISOString();
                    } else if (scan.time) {
                      timeString = scan.time;
                    }
                    // Manual section entry
                    const section = sectionInputs[tag] || '';
                    const statusMsg = submitStatus[tag];
                    return (
                      <React.Fragment key={tag + idx}>
                        <tr className="border-b">
                          <td className="px-4 py-2 font-mono text-blue-700">{tag}</td>
                          <td className="px-4 py-2 text-gray-700">{timeString}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">{scan.status || 'Scanned'}</span>
                          </td>
                        </tr>
                        <tr className="border-b bg-blue-50">
                          <td colSpan={3} className="px-4 py-2">
                            <form
                              className="flex flex-col md:flex-row items-center gap-2"
                              onSubmit={async (e) => {
                                e.preventDefault();
                                setSubmitStatus(s => ({ ...s, [tag]: 'Saving...' }));
                                try {
                                  const res = await fetch('http://localhost:5001/api/scans', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      tag,
                                      status: scan.status || 'Scanned',
                                      timestamp: timestamp || new Date().toISOString(),
                                      section
                                    })
                                  });
                                  const data = await res.json();
                                  if (!res.ok) throw new Error(data.error || 'Failed to save');
                                  setSubmitStatus(s => ({ ...s, [tag]: 'Saved!' }));
                                } catch (err) {
                                  setSubmitStatus(s => ({ ...s, [tag]: 'Error: ' + err.message }));
                                }
                              }}
                            >
                              <label htmlFor={`section-${tag}`} className="font-medium text-blue-700 flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> Section:
                              </label>
                              <select
                                id={`section-${tag}`}
                                className="border rounded px-2 py-1"
                                value={section}
                                onChange={e => setSectionInputs(inputs => ({ ...inputs, [tag]: e.target.value }))}
                                required
                              >
                                <option value="">Select...</option>
                                <option value="Warehouse">Warehouse Available Stock</option>
                                <option value="Packaging">Packaging Section</option>
                                <option value="Finished">Finished Stage</option>
                                <option value="Dispatched">Dispatched Stage</option>
                              </select>
                              <button
                                type="submit"
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                              >
                                Save
                              </button>
                              {statusMsg && (
                                <span className="ml-2 text-xs text-green-700">{statusMsg}</span>
                              )}
                            </form>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringPage;

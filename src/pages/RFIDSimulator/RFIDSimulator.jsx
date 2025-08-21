import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // 🔑 make sure to install: npm install jwt-decode

function RFIDSimulator() {
  const [receiptNumber, setReceiptNumber] = useState("");
  const [tagUid, setTagUid] = useState("");
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState(null); // 🔑 store user role

  const token = localStorage.getItem("access_token");

  // 🔑 Decode token to extract role
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role || null);
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, [token]);

  // Load events to pick from
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("http://localhost:8000/events/list/");
        setEvents(res.data || []);
      } catch (e) {
        console.error("Failed to fetch events", e);
      }
    })();
  }, []);

  const assignBracelet = async () => {
    setMessage("");
    if (!receiptNumber || !tagUid) {
      setMessage("Enter receipt number and tag UID.");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:8000/rfid/assign/",
        { receipt_number: receiptNumber, tag_uid: tagUid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Assigned: ${res.data.tag_uid} -> ${res.data.reservation}`);
    } catch (e) {
      console.error(e);
      setMessage(e.response?.data?.detail || "Assign failed.");
    }
  };

  const simulateScan = async () => {
    setMessage("");
    if (!tagUid || !eventId || !amount) {
      setMessage("Enter tag UID, choose event and amount.");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:8000/rfid/simulate-scan/",
        { tag_uid: tagUid, event_id: eventId, amount, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(
        `OK: ${res.data.detail}. New balance: ${res.data.new_balance} DT (event=${res.data.event}, amount=${res.data.amount}).`
      );
      setAmount("");
      setDescription("");
    } catch (e) {
      console.error(e);
      setMessage(e.response?.data?.detail || "Scan failed.");
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "80px auto", padding: 20 }}>
      <h2>Virtual RFID Simulator</h2>
      <p style={{ opacity: 0.8, marginTop: -8 }}>
        Use this page to test bracelet assignment and purchases without hardware.
      </p>

      {/* 🔑 Show assign block only if role === "admin" */}
      {role === "admin" && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
          }}
        >
          <h3>1) Assign Tag to Reservation</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: 12,
            }}
          >
            <input
              type="text"
              placeholder="Receipt number (e.g. RECEIPT-5-0001)"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
            />
            <input
              type="text"
              placeholder="Tag UID (any unique string)"
              value={tagUid}
              onChange={(e) => setTagUid(e.target.value)}
            />
            <button onClick={assignBracelet}>Assign</button>
          </div>
        </div>
      )}

      {/* Simulate Scan is visible for everyone */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          marginTop: 16,
        }}
      >
        <h3>2) Simulate Scan & Purchase</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: 12,
          }}
        >
          <input
            type="text"
            placeholder="Tag UID (must be assigned)"
            value={tagUid}
            onChange={(e) => setTagUid(e.target.value)}
          />
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">Select event</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={simulateScan}>Scan</button>
        </div>
        <textarea
          placeholder="Description (optional)"
          style={{ width: "100%", marginTop: 12 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {message && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f5f7ff",
            border: "1px solid #dfe3ff",
            borderRadius: 8,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default RFIDSimulator;

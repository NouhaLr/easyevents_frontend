import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Wallet.css";

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access_token");

  // Charger wallet et transactions
  const fetchWallet = async () => {
    try {
      const res = await axios.get("http://localhost:8000/wallet/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawBalance = res.data.balance;
      const numericBalance = parseFloat(rawBalance);

      console.log("Fetched balance:", rawBalance, "| Parsed:", numericBalance);

      setBalance(numericBalance);
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      setMessage("Failed to load wallet data.");
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  // Recharger wallet
  const handleRecharge = async () => {
    if (!rechargeAmount || isNaN(rechargeAmount) || rechargeAmount <= 0) {
      setMessage("Please enter a valid positive amount");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/wallet/recharge/",
        { amount: rechargeAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.detail);
      setRechargeAmount("");
      fetchWallet();
    } catch (error) {
      console.error("Recharge error:", error);
      setMessage("Failed to recharge wallet.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) =>
    tx.event_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="wallet-container"
      style={{ maxWidth: 600, margin: "auto", padding: 20 }}
    >
      <h2>My Wallet</h2>
      <p>
        <strong>Balance:</strong>{" "}
        <span>{!isNaN(balance) ? balance.toFixed(2) : "0.00"} DT</span>
      </p>

      <div style={{ marginBottom: 20 }}>
        <input
          type="number"
          placeholder="Amount to charge"
          value={rechargeAmount}
          onChange={(e) => setRechargeAmount(e.target.value)}
          style={{ marginRight: 10, padding: 6, width: 150 }}
          disabled={loading}
        />
        <button onClick={handleRecharge} disabled={loading}>
          {loading ? "Processing..." : "Charge account"}
        </button>
      </div>

      {message && <p style={{ color: "red" }}>{message}</p>}

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: 6 }}
        />
      </div>

      <h3>Transactions</h3>
{filteredTransactions.length === 0 && <p>No transactions found.</p>}
<ul style={{ listStyle: "none", paddingLeft: 0 }}>
  {filteredTransactions.map((tx) => (
    <li
      key={tx.id}
      style={{ borderBottom: "1px solid #ccc", padding: "8px 0" }}
    >
      <div>
        <strong>Event:</strong> {tx.event_name}
      </div>
      <div>
        <strong>Amount:</strong>{" "}
        {Number(tx.amount) ? Number(tx.amount).toFixed(2) : "0.00"} DT
      </div>
      <div>
        <strong>Date:</strong> {new Date(tx.timestamp).toLocaleString()}
      </div>
      <div>
        <strong>Description:</strong> {tx.description || "-"}
      </div>
    </li>
  ))}
</ul>

    </div>
  );
}
export default Wallet;

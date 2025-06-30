// components/AdminSendMoney.js
"use client"
import { useState } from "react";

export default function AdminSendMoney() {
  const [providerId, setProviderId] = useState("");
  const [amount, setAmount] = useState("");

  const handleSend = async () => {
    const res = await fetch("/api/provider/wallet/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, amount: parseFloat(amount) }),
    });

    const data = await res.json();
    alert(data.message || "Sent");
  };

  return (
    <div>
      <h3>Admin: Send Money to Provider Wallet</h3>
      <input placeholder="Provider ID" value={providerId} onChange={e => setProviderId(e.target.value)} />
      <input placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
      <button onClick={handleSend}>Send Money</button>
    </div>
  );
}

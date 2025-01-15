import React, { useState } from "react";
import { useParams } from "react-router-dom";

const Chat = () => {
  const { streamerId } = useParams();

    const [formData, setFormData] = useState({
    name: "",
    message: "",
    amount: "",
  });

  const [chatLogs, setChatLogs] = useState([]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Add the new message to the chat logs
    setChatLogs([...chatLogs, formData]);

    // Reset the form
    setFormData({
      name: "",
      message: "",
      amount: "",
    });
  };

  return (
    <div>
      <h1>Chat Page</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Send</button>
      </form>

      {/* Chat Logs */}
      <div>
        <h2>Chat Logs:</h2>
        {chatLogs.length > 0 ? (
          <ul>
            {chatLogs.map((log, index) => (
              <li key={index}>
                <strong>{log.name}:</strong> {log.message} (Amount: ${log.amount})
              </li>
            ))}
          </ul>
        ) : (
          <p>No messages yet.</p>
        )}
      </div>
    </div>
  );
};

export default Chat;

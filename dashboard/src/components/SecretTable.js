import React, { useEffect, useState } from 'react';

function SecretTable() {
  const [secrets, setSecrets] = useState([]);

  const fetchSecrets = () => {
    fetch('http://localhost:8080/secrets')
      .then(res => res.json())
      .then(data => setSecrets(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSecrets();
    const interval = setInterval(fetchSecrets, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <table border="1" cellPadding="5" style={{ width: '100%', marginTop: '20px' }}>
      <thead>
        <tr>
          <th>Secret</th>
          <th>Service</th>
          <th>Env</th>
          <th>Status</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {secrets.map((s, i) => (
          <tr key={i} style={{ color: s.status === "BLOCK" ? "red" : "green" }}>
            <td>{s.secret}</td>
            <td>{s.service}</td>
            <td>{s.env}</td>
            <td>{s.status}</td>
            <td>{new Date(s.timestamp).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default SecretTable;

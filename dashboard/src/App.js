import React from 'react';
import SecretTable from './components/SecretTable';
import SecretGraph from './components/SecretGraph';

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>SecureKey Dashboard</h1>
      <SecretTable />
      <h2>Secret Lineage Graph</h2>
      <SecretGraph />
    </div>
  );
}

export default App;

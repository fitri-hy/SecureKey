import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls, MiniMap } from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 180;
const nodeHeight = 50;

function layoutElements(nodes, edges) {
  dagreGraph.setGraph({ rankdir: 'LR' });

  nodes.forEach(node => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach(edge => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map(node => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 }
    };
  });

  return { nodes: layoutedNodes, edges };
}

export default function SecretGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [filter, setFilter] = useState('');

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const fetchSecrets = () => {
    fetch('http://localhost:8080/secrets')
      .then(res => res.json())
      .then(data => {
        if (!data || !Array.isArray(data)) return;

        const secretSet = new Set();
        const serviceSet = new Set();
        let newNodes = [];
        let newEdges = [];

        data.forEach((item, index) => {
          // filter
          if (filter && !item.secret.includes(filter) && !item.service.includes(filter)) return;

          const secretId = `secret-${item.secret}`;
          const serviceId = `service-${item.service}-${item.env}`;

          if (!secretSet.has(secretId)) {
            newNodes.push({
              id: secretId,
              data: { label: item.secret, tooltip: `Secret: ${item.secret}` },
              style: { background: '#8fd', color: '#000', padding: 10, borderRadius: 5 },
            });
            secretSet.add(secretId);
          }

          if (!serviceSet.has(serviceId)) {
            newNodes.push({
              id: serviceId,
              data: { 
                label: `${item.service} (${item.env})`, 
                tooltip: `Service: ${item.service}\nEnv: ${item.env}\nStatus: ${item.status}\nTimestamp: ${item.timestamp}`
              },
              style: {
                background: item.status === 'BLOCK' ? '#f88' : '#8f8',
                color: '#000',
                padding: 10,
                borderRadius: 5
              },
            });
            serviceSet.add(serviceId);
          }

          newEdges.push({
            id: `edge-${secretId}-${serviceId}-${index}`,
            source: secretId,
            target: serviceId,
            animated: true,
            style: { stroke: item.status === 'BLOCK' ? 'red' : 'green', strokeWidth: 2 },
          });
        });

        const layouted = layoutElements(newNodes, newEdges);
        setNodes(layouted.nodes);
        setEdges(layouted.edges);
      })
      .catch(err => console.error('Failed to fetch secrets:', err));
  };

  useEffect(() => {
    fetchSecrets();
    const interval = setInterval(fetchSecrets, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc', marginTop: '10px' }}>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Filter secret/service..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: 5, width: 200 }}
        />
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap nodeStrokeColor={n => n.style?.background} nodeColor={n => n.style?.background} />
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}


import React, { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  ConnectionLineType,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Badge } from '@/components/ui/badge';

interface WorkflowViewerProps {
  workflow: {
    name: string;
    description?: string;
    data: any;
  };
}

// Helper function to generate node position
const generateNodePosition = (index: number, totalNodes: number) => {
  // For small workflows, arrange in a simple line
  if (totalNodes <= 3) {
    return { x: 100 + index * 200, y: 100 };
  }
  
  // For larger workflows, create a grid layout
  const cols = Math.ceil(Math.sqrt(totalNodes));
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  return {
    x: col * 220,
    y: row * 150
  };
};

export const WorkflowViewer: React.FC<WorkflowViewerProps> = ({ workflow }) => {
  // Prepare nodes and edges from workflow data
  const prepareElements = () => {
    try {
      // Extract nodes from workflow data
      const workflowData = workflow.data;
      
      if (!workflowData || !workflowData.nodes || !Array.isArray(workflowData.nodes)) {
        console.error('Invalid workflow data:', workflowData);
        return { nodes: [], edges: [] };
      }

      const nodes: Node[] = workflowData.nodes.map((node, index) => {
        const position = generateNodePosition(index, workflowData.nodes.length);
        
        return {
          id: node.id,
          position,
          data: { 
            label: node.name || `Node ${index + 1}`,
            description: node.description,
            type: node.type,
          },
          type: node.type === 'trigger' ? 'input' : 'default',
          style: {
            background: node.type === 'trigger' ? '#9333ea' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            width: 180,
          }
        };
      });

      // Extract edges from workflow connections
      const edges: Edge[] = [];
      
      if (workflowData.connections && Array.isArray(workflowData.connections)) {
        workflowData.connections.forEach((connection) => {
          if (connection.source && connection.target) {
            edges.push({
              id: `${connection.source}-${connection.target}`,
              source: connection.source,
              target: connection.target,
              animated: true,
              type: 'smoothstep',
              style: { stroke: '#64748b', strokeWidth: 2 },
            });
          }
        });
      }

      return { nodes, edges };
    } catch (error) {
      console.error('Error parsing workflow data:', error);
      return { nodes: [], edges: [] };
    }
  };

  const { nodes: initialNodes, edges: initialEdges } = prepareElements();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ height: '60vh', width: '100%' }} className="border border-gray-200 rounded-md shadow-sm overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        connectionLineType={ConnectionLineType.SmoothStep}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Panel position="top-left" className="bg-white p-2 rounded-md shadow-sm">
          <div className="flex flex-col space-y-1">
            <Badge variant="outline" className="mb-1">
              {nodes.length} nodes • {edges.length} connections
            </Badge>
          </div>
        </Panel>
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Controls />
        <Background color="#f8fafc" gap={16} />
      </ReactFlow>
    </div>
  );
};

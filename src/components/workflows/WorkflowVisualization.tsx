
import React, { useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Workflow } from '@/types/workflow';
import ActionNode from './nodes/ActionNode';
import TriggerNode from './nodes/TriggerNode';
import { toast } from '@/hooks/use-toast';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

interface WorkflowVisualizationProps {
  workflow: Workflow;
  loading: boolean;
}

const WorkflowVisualization = ({ workflow, loading }: WorkflowVisualizationProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    if (workflow && !loading) {
      try {
        setIsRendering(true);
        generateNodesAndEdges(workflow);
      } catch (error) {
        console.error('Error generating workflow visualization:', error);
        toast({
          title: "Visualisierungsfehler",
          description: "Der Workflow konnte nicht visualisiert werden.",
          variant: "destructive"
        });
      } finally {
        setIsRendering(false);
      }
    }
  }, [workflow, loading]);

  const generateNodesAndEdges = (workflow: Workflow) => {
    if (!workflow.nodes || workflow.nodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Create nodes
    const generatedNodes: Node[] = workflow.nodes.map((node, index) => {
      const isFirst = index === 0;
      
      return {
        id: node.id,
        type: isFirst ? 'trigger' : 'action',
        data: {
          label: node.name,
          description: node.description || '',
          status: node.status || 'pending',
          type: node.type || (isFirst ? 'trigger' : 'action'),
        },
        position: { x: 100, y: index * 150 },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      };
    });

    // Create edges
    const generatedEdges: Edge[] = [];
    
    for (let i = 0; i < workflow.nodes.length - 1; i++) {
      generatedEdges.push({
        id: `e${workflow.nodes[i].id}-${workflow.nodes[i + 1].id}`,
        source: workflow.nodes[i].id,
        target: workflow.nodes[i + 1].id,
        animated: true,
        style: { strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      });
    }

    // Create branch edges if connections exist
    if (workflow.connections) {
      workflow.connections.forEach(conn => {
        if (!generatedEdges.some(e => e.source === conn.from && e.target === conn.to)) {
          generatedEdges.push({
            id: `e${conn.from}-${conn.to}`,
            source: conn.from,
            target: conn.to,
            animated: true,
            style: { 
              strokeWidth: 2,
              stroke: conn.status === 'error' ? '#ff0000' : '#888888',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            label: conn.label || '',
            labelStyle: { fill: '#444', fontWeight: 500 },
          });
        }
      });
    }

    setNodes(generatedNodes);
    setEdges(generatedEdges);
  };

  if (loading || isRendering) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Visualisierung wird geladen...</span>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Kein Workflow ausgewählt.</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full">
      <h2 className="text-xl font-bold mb-4">{workflow.name}</h2>
      {workflow.description && <p className="text-gray-500 mb-4">{workflow.description}</p>}
      
      <div style={{ width: '100%', height: '500px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Controls />
          <Background color="#f5f5f5" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowVisualization;

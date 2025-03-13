
import React, { useEffect, useState } from 'react';
import { useNotes, Note } from '@/contexts/NotesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const KnowledgeGraph = () => {
  const { notes } = useNotes();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [graphReady, setGraphReady] = useState(false);

  // Convert notes to graph nodes and edges
  useEffect(() => {
    if (notes.length === 0) return;

    const nodePositions: Record<string, { x: number, y: number }> = {};

    // Create nodes in a circular layout
    const graphNodes: Node[] = notes.map((note, index) => {
      const angle = (index / notes.length) * 2 * Math.PI;
      const radius = Math.min(window.innerWidth, window.innerHeight) * 0.35;
      const x = window.innerWidth / 2 + radius * Math.cos(angle);
      const y = window.innerHeight / 2 + radius * Math.sin(angle);
      
      nodePositions[note.id] = { x, y };
      
      return {
        id: note.id,
        data: { 
          label: note.title,
          contentType: note.contentType,
          tags: note.tags 
        },
        position: { x, y },
        style: {
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px',
          width: 180,
        },
      };
    });

    // Create edges for explicit connections
    const graphEdges: Edge[] = [];
    
    notes.forEach(note => {
      // Add explicit connections
      if (note.connections) {
        note.connections.forEach(targetId => {
          graphEdges.push({
            id: `${note.id}->${targetId}`,
            source: note.id,
            target: targetId,
            animated: false,
            style: { stroke: '#3b82f6' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3b82f6',
            },
          });
        });
      }
      
      // Add mention connections (rendered differently)
      if (note.mentions) {
        note.mentions.forEach(targetId => {
          graphEdges.push({
            id: `${note.id}->mention-${targetId}`,
            source: note.id,
            target: targetId,
            animated: true,
            style: { stroke: '#8b5cf6', strokeDasharray: '5,5' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#8b5cf6',
            },
          });
        });
      }
    });

    setNodes(graphNodes);
    setEdges(graphEdges);
    setGraphReady(true);
  }, [notes, setNodes, setEdges]);

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    navigate(`/?noteId=${node.id}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-4 pt-4">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notes
        </Button>
        <h1 className="text-xl font-bold">Knowledge Graph</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>
      
      <Card className="flex-1 relative overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-lg">Connections Map</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-4rem)]">
          {graphReady ? (
            <div className="w-full h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                fitView
                attributionPosition="bottom-right"
              >
                <Background />
                <Controls />
                <Panel position="top-left" className="bg-white p-2 rounded-md shadow-sm">
                  <div className="text-sm">
                    <div className="flex items-center mb-1">
                      <div className="h-2 w-8 bg-[#3b82f6] mr-2 rounded-full"></div>
                      <span>Explicit Link</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-8 bg-[#8b5cf6] mr-2 rounded-full" style={{ borderStyle: 'dashed' }}></div>
                      <span>Mention ([[note]])</span>
                    </div>
                  </div>
                </Panel>
              </ReactFlow>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading graph...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeGraph;

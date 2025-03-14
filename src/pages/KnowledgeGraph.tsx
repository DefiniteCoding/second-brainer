import React, { useEffect, useState, useMemo } from 'react';
import { useNotes, Note, Tag } from '@/contexts/NotesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Radar, FolderTree, NetworkIcon, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  NodeMouseHandler,
  NodeTypes,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

type LayoutType = 'force' | 'radial' | 'tree' | 'cluster';

const KnowledgeGraph = () => {
  const { notes, tags } = useNotes();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [graphReady, setGraphReady] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [layout, setLayout] = useState<LayoutType>('force');
  const [selectedTagsFilter, setSelectedTagsFilter] = useState<string[]>([]);
  const reactFlowInstance = useReactFlow();

  // Filtered notes based on search and tag filters
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = searchTerm === '' || 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTagsFilter.length === 0 || 
        note.tags.some(tag => selectedTagsFilter.includes(tag.id));
      
      return matchesSearch && matchesTags;
    });
  }, [notes, searchTerm, selectedTagsFilter]);

  // Convert notes to graph nodes and edges
  useEffect(() => {
    if (filteredNotes.length === 0) return;

    // Create nodes based on the selected layout
    let graphNodes: Node[] = [];
    
    if (layout === 'radial') {
      // Radial layout
      graphNodes = filteredNotes.map((note, index) => {
        const angle = (index / filteredNotes.length) * 2 * Math.PI;
        const radius = Math.min(window.innerWidth, window.innerHeight) * 0.35;
        const x = window.innerWidth / 2 + radius * Math.cos(angle);
        const y = window.innerHeight / 2 + radius * Math.sin(angle);
        
        return createNodeFromNote(note, x, y);
      });
    } else if (layout === 'tree') {
      // Tree layout (simple version)
      const levelsMap = new Map<string, number>();
      const processedNodes = new Set<string>();
      
      // First find root nodes (no incoming connections)
      const nodesWithIncomingEdges = new Set<string>();
      
      notes.forEach(note => {
        if (note.connections) {
          note.connections.forEach(targetId => {
            nodesWithIncomingEdges.add(targetId);
          });
        }
        if (note.mentions) {
          note.mentions.forEach(targetId => {
            nodesWithIncomingEdges.add(targetId);
          });
        }
      });
      
      const rootNodes = filteredNotes.filter(note => !nodesWithIncomingEdges.has(note.id));
      
      // Assign levels to nodes
      const assignLevels = (noteId: string, level: number) => {
        if (processedNodes.has(noteId)) return;
        
        processedNodes.add(noteId);
        levelsMap.set(noteId, level);
        
        const note = notes.find(n => n.id === noteId);
        if (!note) return;
        
        const connections = [...(note.connections || []), ...(note.mentions || [])];
        connections.forEach((targetId, idx) => {
          if (filteredNotes.some(n => n.id === targetId)) {
            assignLevels(targetId, level + 1);
          }
        });
      };
      
      rootNodes.forEach((note, idx) => {
        assignLevels(note.id, 0);
      });
      
      // Position nodes based on levels
      const levelCounts = new Map<number, number>();
      const levelCurrentPos = new Map<number, number>();
      
      // Count nodes per level
      for (const level of levelsMap.values()) {
        levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
      }
      
      // Create nodes with positions
      filteredNotes.forEach(note => {
        const level = levelsMap.get(note.id) || 0;
        const totalInLevel = levelCounts.get(level) || 1;
        const currentPos = levelCurrentPos.get(level) || 0;
        
        const verticalSpacing = 120;
        const horizontalSpacing = Math.min(200, window.innerWidth / (totalInLevel + 1));
        
        const x = horizontalSpacing * (currentPos + 1);
        const y = 100 + level * verticalSpacing;
        
        levelCurrentPos.set(level, currentPos + 1);
        
        graphNodes.push(createNodeFromNote(note, x, y));
      });
    } else if (layout === 'cluster') {
      // Cluster by tags
      const tagGroups = new Map<string, Note[]>();
      
      // Group notes by their primary tag (first tag)
      filteredNotes.forEach(note => {
        const primaryTag = note.tags.length > 0 ? note.tags[0].id : 'untagged';
        if (!tagGroups.has(primaryTag)) {
          tagGroups.set(primaryTag, []);
        }
        tagGroups.get(primaryTag)?.push(note);
      });
      
      // Position each cluster
      let clusterIndex = 0;
      const totalClusters = tagGroups.size;
      
      tagGroups.forEach((clusterNotes, tagId) => {
        const angle = (clusterIndex / totalClusters) * 2 * Math.PI;
        const clusterRadius = Math.min(window.innerWidth, window.innerHeight) * 0.3;
        const clusterX = window.innerWidth / 2 + clusterRadius * Math.cos(angle);
        const clusterY = window.innerHeight / 2 + clusterRadius * Math.sin(angle);
        
        // Position notes in a small circle within their cluster
        clusterNotes.forEach((note, noteIndex) => {
          const noteAngle = (noteIndex / clusterNotes.length) * 2 * Math.PI;
          const noteRadius = 80; // Small radius for the cluster
          const x = clusterX + noteRadius * Math.cos(noteAngle);
          const y = clusterY + noteRadius * Math.sin(noteAngle);
          
          graphNodes.push(createNodeFromNote(note, x, y));
        });
        
        clusterIndex++;
      });
    } else {
      // Default force-directed layout
      // Start with random positions and let the force simulation position them
      graphNodes = filteredNotes.map((note, index) => {
        const x = 100 + Math.random() * (window.innerWidth - 200);
        const y = 100 + Math.random() * (window.innerHeight - 200);
        
        return createNodeFromNote(note, x, y);
      });
    }

    // Create edges
    const graphEdges: Edge[] = [];
    
    filteredNotes.forEach(note => {
      // Only create edges if both source and target are in the filtered set
      if (note.connections) {
        note.connections.forEach(targetId => {
          if (filteredNotes.some(n => n.id === targetId)) {
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
          }
        });
      }
      
      if (note.mentions) {
        note.mentions.forEach(targetId => {
          if (filteredNotes.some(n => n.id === targetId)) {
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
          }
        });
      }
    });

    setNodes(graphNodes);
    setEdges(graphEdges);
    setGraphReady(true);
    
    // Auto-layout with force simulation for the force-directed layout
    if (layout === 'force' && filteredNotes.length > 0) {
      simulateForceLayout(graphNodes, graphEdges);
    }
  }, [filteredNotes, layout, setNodes, setEdges]);

  const createNodeFromNote = (note: Note, x: number, y: number): Node => {
    return {
      id: note.id,
      data: { 
        label: note.title,
        contentType: note.contentType,
        tags: note.tags,
        connections: note.connections?.length || 0,
        mentions: note.mentions?.length || 0
      },
      position: { x, y },
      style: {
        background: note.tags.length > 0 ? note.tags[0].color : '#ffffff',
        color: note.tags.length > 0 ? '#ffffff' : 'inherit',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '10px',
        width: 180,
      },
    };
  };

  const simulateForceLayout = (nodes: Node[], edges: Edge[]) => {
    // Simple force-directed layout simulation
    const simulation = {
      alpha: 1,
      nodes: [...nodes],
      iterations: 50,
    };

    // Create a mapping of node IDs to their indices in the nodes array
    const nodeIndices = new Map<string, number>();
    simulation.nodes.forEach((node, index) => {
      nodeIndices.set(node.id, index);
    });

    // Run the simulation
    for (let i = 0; i < simulation.iterations; i++) {
      // Reduce alpha over time
      simulation.alpha *= 0.99;
      if (simulation.alpha < 0.001) break;

      // Apply forces
      // 1. Center attraction force
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const centerForce = 0.01 * simulation.alpha;

      // 2. Node repulsion
      const repulsionForce = 5000 * simulation.alpha;

      // 3. Edge attraction
      const edgeForce = 0.2 * simulation.alpha;

      // Calculate forces
      for (let i = 0; i < simulation.nodes.length; i++) {
        const node = simulation.nodes[i];
        let fx = (centerX - node.position.x) * centerForce;
        let fy = (centerY - node.position.y) * centerForce;

        // Repulsion from other nodes
        for (let j = 0; j < simulation.nodes.length; j++) {
          if (i === j) continue;
          
          const otherNode = simulation.nodes[j];
          const dx = node.position.x - otherNode.position.x;
          const dy = node.position.y - otherNode.position.y;
          const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          
          fx += (dx / distance) * (repulsionForce / distance);
          fy += (dy / distance) * (repulsionForce / distance);
        }

        // Attraction from edges
        edges.forEach(edge => {
          if (edge.source === node.id || edge.target === node.id) {
            const sourceIndex = nodeIndices.get(edge.source);
            const targetIndex = nodeIndices.get(edge.target);
            
            if (sourceIndex !== undefined && targetIndex !== undefined) {
              const sourceNode = simulation.nodes[sourceIndex];
              const targetNode = simulation.nodes[targetIndex];
              
              const dx = sourceNode.position.x - targetNode.position.x;
              const dy = sourceNode.position.y - targetNode.position.y;
              
              if (edge.source === node.id) {
                fx -= dx * edgeForce;
                fy -= dy * edgeForce;
              } else {
                fx += dx * edgeForce;
                fy += dy * edgeForce;
              }
            }
          }
        });

        // Update position
        node.position.x += fx;
        node.position.y += fy;

        // Constrain to viewport with padding
        const padding = 100;
        node.position.x = Math.max(padding, Math.min(window.innerWidth - padding, node.position.x));
        node.position.y = Math.max(padding, Math.min(window.innerHeight - padding, node.position.y));
      }
    }

    // Update node positions
    setNodes(simulation.nodes);
  };

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    setSelectedNode(node);
  };

  const handleOpenNote = () => {
    if (selectedNode) {
      navigate(`/?noteId=${selectedNode.id}`);
    }
  };

  const toggleTagFilter = (tagId: string) => {
    setSelectedTagsFilter(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const resetView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
    setSelectedNode(null);
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
      
      <div className="flex items-center gap-2 px-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter graph..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Tag className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Filter by Tags</h3>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {tags.map(tag => (
                    <div 
                      key={tag.id} 
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                        selectedTagsFilter.includes(tag.id) ? 'bg-primary/10' : 'hover:bg-accent'
                      }`}
                      onClick={() => toggleTagFilter(tag.id)}
                    >
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <span className="text-sm">{tag.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <NetworkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Layout Options</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={layout === 'force' ? "default" : "outline"} 
                  size="sm"
                  className="w-full flex items-center gap-2"
                  onClick={() => setLayout('force')}
                >
                  <NetworkIcon className="h-4 w-4" />
                  <span>Force</span>
                </Button>
                <Button 
                  variant={layout === 'radial' ? "default" : "outline"} 
                  size="sm"
                  className="w-full flex items-center gap-2"
                  onClick={() => setLayout('radial')}
                >
                  <Radar className="h-4 w-4" />
                  <span>Radial</span>
                </Button>
                <Button 
                  variant={layout === 'tree' ? "default" : "outline"} 
                  size="sm"
                  className="w-full flex items-center gap-2"
                  onClick={() => setLayout('tree')}
                >
                  <FolderTree className="h-4 w-4" />
                  <span>Tree</span>
                </Button>
                <Button 
                  variant={layout === 'cluster' ? "default" : "outline"} 
                  size="sm"
                  className="w-full flex items-center gap-2"
                  onClick={() => setLayout('cluster')}
                >
                  <Tag className="h-4 w-4" />
                  <span>Clusters</span>
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <Card className="flex-1 relative overflow-hidden">
        <CardContent className="p-0 h-full">
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
                <Background 
                  variant={BackgroundVariant.Dots} 
                  gap={20} 
                  size={1}
                />
                <Controls showInteractive={false} />
                <MiniMap 
                  nodeColor={(node) => {
                    const nodeTags = (node.data?.tags || []) as Tag[];
                    return nodeTags.length > 0 ? nodeTags[0].color : '#cccccc';
                  }}
                />
                
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
                
                <Panel position="bottom-left" className="bg-white p-2 rounded-md shadow-sm">
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={resetView}>
                            <Maximize className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reset View</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
      
      {selectedNode && (
        <Card className="absolute right-8 top-20 w-72 shadow-lg">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">{selectedNode.data.label}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-1 mb-4">
              {selectedNode.data.tags && (selectedNode.data.tags as Tag[]).map((tag: Tag) => (
                <Badge 
                  key={tag.id} 
                  style={{ backgroundColor: tag.color }}
                  className="text-white"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            <div className="flex text-sm text-muted-foreground mb-4">
              <div className="flex-1 flex items-center gap-1">
                <NetworkIcon className="h-3 w-3" />
                <span>{selectedNode.data.connections} connections</span>
              </div>
              <div className="flex-1 flex items-center gap-1">
                <Search className="h-3 w-3" />
                <span>{selectedNode.data.mentions} mentions</span>
              </div>
            </div>
            <Button 
              onClick={handleOpenNote}
              className="w-full"
            >
              Open Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KnowledgeGraph;

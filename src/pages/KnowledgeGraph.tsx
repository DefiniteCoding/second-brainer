import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNotes, Note, Tag } from '@/contexts/NotesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Radar, FolderTree, NetworkIcon, Search, Filter, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  ReactFlowProvider,
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  useReactFlow,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Interface for Flow Node Data that extends Note
interface NodeData {
  id?: string;
  title?: string;
  content?: string;
  contentType?: 'text' | 'image' | 'link' | 'audio' | 'video';
  createdAt?: Date;
  updatedAt?: Date;
  tags?: Tag[];
  source?: string;
  location?: { latitude: number; longitude: number };
  mediaUrl?: string;
  connections: number; 
  mentions: number;
  showPreview?: boolean;
  [key: string]: unknown;
}

// Type definitions
type Node = ReactFlowNode<NodeData>;
type Edge = ReactFlowEdge<{ type: 'connection' | 'mention' }>;

// Node types
const NODE_TYPES = {
  text: 'text',
  image: 'image',
  link: 'link',
  audio: 'audio',
  video: 'video'
};

// Graph layout types
type LayoutType = 'force' | 'circular' | 'tree';

// Colors for different content types
const contentTypeColors = {
  text: '#3b82f6',  // blue
  image: '#10b981', // green
  link: '#8b5cf6',  // purple
  audio: '#f59e0b', // amber
  video: '#ef4444'  // red
};

// Custom Flow Node component
const CustomNode = ({ data }: { data: NodeData }) => {
  let bgColor = contentTypeColors[data.contentType || 'text'];
  
  // If note has tags, use the first tag's color
  if (data.tags && data.tags.length > 0) {
    bgColor = data.tags[0].color;
  }
  
  return (
    <div 
      className={`px-2 py-1.5 rounded-md shadow-md border transition-all duration-200 hover:shadow-lg ${
        data.showPreview ? 'w-[250px]' : 'w-auto max-w-[150px]'
      }`} 
      style={{ borderColor: bgColor, backgroundColor: 'var(--background)' }}
    >
      <div className="text-sm font-medium truncate">{data.title}</div>
      
      {data.showPreview && (
        <div className="mt-1 text-xs text-muted-foreground line-clamp-3 overflow-hidden">
          {data.content?.substring(0, 100)}...
        </div>
      )}
      
      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bgColor }}></span>
        <span>{data.contentType}</span>
        
        {data.connections > 0 && (
          <span className="ml-auto flex items-center gap-0.5">
            <NetworkIcon className="h-3 w-3" /> {data.connections}
          </span>
        )}
      </div>
      
      {data.tags && data.tags.length > 0 && data.showPreview && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {data.tags.slice(0, 3).map(tag => (
            <Badge 
              key={tag.id} 
              variant="outline" 
              className="text-[9px] py-0 h-4"
              style={{ borderColor: tag.color, color: tag.color }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 rounded-sm bg-muted-foreground/50" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 rounded-sm bg-muted-foreground/50" 
      />
    </div>
  );
};

// Import the Handle component
import { Handle } from '@xyflow/react';

// Helper functions to generate graph layouts
const generateForceDirectedLayout = (notes: Note[]): { nodes: Node[], edges: Edge[] } => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
  
  // Calculate node positions in a force-directed-like layout (simplified)
  const nodes: Node[] = notes.map((note, i) => {
    // Place nodes in a spiral pattern
    const angle = i * (Math.PI * 2) / notes.length;
    const spiralFactor = 1 + (i / notes.length) * 0.5;
    
    return {
      id: note.id,
      position: { 
        x: centerX + Math.cos(angle) * radius * spiralFactor, 
        y: centerY + Math.sin(angle) * radius * spiralFactor 
      },
      type: 'default',
      data: {
        ...note,
        connections: note.connections?.length || 0,
        mentions: note.mentions?.length || 0,
        showPreview: false
      }
    };
  });
  
  // Create edges
  const edges: Edge[] = [];
  
  // Connection edges
  notes.forEach(note => {
    if (note.connections) {
      note.connections.forEach(connId => {
        edges.push({
          id: `conn-${note.id}-${connId}`,
          source: note.id,
          target: connId,
          animated: false,
          style: { stroke: '#666', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
          data: { type: 'connection' }
        });
      });
    }
    
    // Mention edges
    if (note.mentions) {
      note.mentions.forEach(mentionId => {
        edges.push({
          id: `mention-${note.id}-${mentionId}`,
          source: note.id,
          target: mentionId,
          animated: true,
          style: { stroke: '#999', strokeWidth: 1, strokeDasharray: '5 5' },
          data: { type: 'mention' }
        });
      });
    }
  });
  
  return { nodes, edges };
};

const generateCircularLayout = (notes: Note[]): { nodes: Node[], edges: Edge[] } => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
  
  // Group notes by tags
  const tagGroups: Record<string, Note[]> = {};
  
  notes.forEach(note => {
    const tagId = note.tags.length > 0 ? note.tags[0].id : 'untagged';
    if (!tagGroups[tagId]) {
      tagGroups[tagId] = [];
    }
    tagGroups[tagId].push(note);
  });
  
  // Calculate positions for each group
  const nodes: Node[] = [];
  let groupIdx = 0;
  const groupCount = Object.keys(tagGroups).length;
  
  Object.entries(tagGroups).forEach(([tagId, groupNotes]) => {
    const groupAngle = (groupIdx / groupCount) * Math.PI * 2;
    const groupCenterX = centerX + Math.cos(groupAngle) * (radius * 0.5);
    const groupCenterY = centerY + Math.sin(groupAngle) * (radius * 0.5);
    
    // Position notes in a circle within their group
    groupNotes.forEach((note, i) => {
      const noteAngle = (i / groupNotes.length) * Math.PI * 2;
      const groupRadius = radius * 0.3;
      
      nodes.push({
        id: note.id,
        position: { 
          x: groupCenterX + Math.cos(noteAngle) * groupRadius, 
          y: groupCenterY + Math.sin(noteAngle) * groupRadius 
        },
        data: {
          ...note,
          connections: note.connections?.length || 0,
          mentions: note.mentions?.length || 0
        }
      });
    });
    
    groupIdx++;
  });
  
  // Create edges (same as in force directed)
  const edges: Edge[] = [];
  
  notes.forEach(note => {
    if (note.connections) {
      note.connections.forEach(connId => {
        edges.push({
          id: `conn-${note.id}-${connId}`,
          source: note.id,
          target: connId,
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed },
          data: { type: 'connection' }
        });
      });
    }
    
    if (note.mentions) {
      note.mentions.forEach(mentionId => {
        edges.push({
          id: `mention-${note.id}-${mentionId}`,
          source: note.id,
          target: mentionId,
          animated: true,
          data: { type: 'mention' }
        });
      });
    }
  });
  
  return { nodes, edges };
};

const generateTreeLayout = (notes: Note[]): { nodes: Node[], edges: Edge[] } => {
  const nodesToConnections = notes.map(note => ({
    noteId: note.id,
    connectionCount: (note.connections?.length || 0) + (note.mentions?.length || 0)
  })).sort((a, b) => b.connectionCount - a.connectionCount);
  
  const centerX = window.innerWidth / 2;
  const levelHeight = 100;
  const siblingDistance = 150;
  
  // Take top 5 nodes as roots
  const rootIds = nodesToConnections.slice(0, 5).map(n => n.noteId);
  
  // Track assigned nodes
  const assignedNodes = new Set<string>(rootIds);
  const nodeMap = new Map<string, Node>();
  
  // Create root nodes
  const rootNodes = rootIds.map((rootId, i) => {
    const note = notes.find(n => n.id === rootId)!;
    const node: Node = {
      id: rootId,
      position: { 
        x: centerX + (i - Math.floor(rootIds.length / 2)) * siblingDistance * 2, 
        y: 100 
      },
      data: {
        ...note,
        connections: note.connections?.length || 0,
        mentions: note.mentions?.length || 0
      }
    };
    nodeMap.set(rootId, node);
    return node;
  });
  
  // Create child nodes (simplified tree layout)
  const edges: Edge[] = [];
  let currentLevel = 1;
  let prevLevelNodes = rootIds;
  
  // Process up to 3 levels deep max
  while (currentLevel < 4) {
    const currentLevelNodes: string[] = [];
    
    prevLevelNodes.forEach(parentId => {
      const parentNote = notes.find(n => n.id === parentId);
      if (!parentNote) return;
      
      const parentNode = nodeMap.get(parentId)!;
      
      // Process connected nodes
      const connections = [
        ...(parentNote.connections || []),
        ...(parentNote.mentions || []),
      ];
      
      const uniqueConnections = [...new Set(connections)];
      const validConnections = uniqueConnections.filter(id => !assignedNodes.has(id));
      
      validConnections.forEach((childId, i) => {
        const childNote = notes.find(n => n.id === childId);
        if (!childNote) return;
        
        assignedNodes.add(childId);
        currentLevelNodes.push(childId);
        
        // Position child relative to parent
        const offset = (i - (validConnections.length - 1) / 2) * siblingDistance;
        
        const node: Node = {
          id: childId,
          position: { 
            x: parentNode.position.x + offset, 
            y: parentNode.position.y + levelHeight 
          },
          data: {
            ...childNote,
            connections: childNote.connections?.length || 0,
            mentions: childNote.mentions?.length || 0
          }
        };
        
        nodeMap.set(childId, node);
        
        // Add the edge
        const isConnection = parentNote.connections?.includes(childId);
        edges.push({
          id: `${parentId}-${childId}`,
          source: parentId,
          target: childId,
          animated: !isConnection,
          markerEnd: isConnection ? { type: MarkerType.ArrowClosed } : undefined,
          data: { type: isConnection ? 'connection' : 'mention' }
        });
      });
    });
    
    prevLevelNodes = currentLevelNodes;
    currentLevel++;
    
    // If no more nodes to process, break
    if (currentLevelNodes.length === 0) break;
  }
  
  // Add remaining unassigned nodes in a grid at the bottom
  const remainingNotes = notes.filter(note => !assignedNodes.has(note.id));
  const gridColumns = Math.ceil(Math.sqrt(remainingNotes.length));
  const gridX = centerX - (gridColumns * siblingDistance) / 2;
  const gridY = 100 + levelHeight * (currentLevel + 1);
  
  remainingNotes.forEach((note, i) => {
    const col = i % gridColumns;
    const row = Math.floor(i / gridColumns);
    
    const node: Node = {
      id: note.id,
      position: { 
        x: gridX + col * siblingDistance, 
        y: gridY + row * levelHeight 
      },
      data: {
        ...note,
        connections: note.connections?.length || 0,
        mentions: note.mentions?.length || 0
      }
    };
    
    nodeMap.set(note.id, node);
  });
  
  // Combine all nodes
  const allNodes = Array.from(nodeMap.values());
  
  return { nodes: allNodes, edges };
};

// Flow component that will be wrapped with ReactFlowProvider
const KnowledgeGraphFlow = () => {
  const { notes, tags } = useNotes();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layout, setLayout] = useState<LayoutType>('force');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showPreviews, setShowPreviews] = useState(false);
  const [showMentions, setShowMentions] = useState(true);
  const reactFlowInstance = useReactFlow();
  
  // Filter state
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const [activeContentTypes, setActiveContentTypes] = useState<string[]>([]);
  
  // Define the nodeTypes
  const nodeTypes = useMemo(() => ({ 
    default: CustomNode
  }), []);

  // Generate the initial graph when notes load
  useEffect(() => {
    if (notes.length > 0) {
      regenerateGraph();
    }
  }, [notes, layout, showPreviews]);
  
  // Apply filters when they change
  useEffect(() => {
    if (notes.length > 0) {
      regenerateGraph();
    }
  }, [activeTagIds, activeContentTypes, showMentions]);
  
  const regenerateGraph = useCallback(() => {
    // Apply filters
    let filteredNotes = notes;
    
    if (activeTagIds.length > 0) {
      filteredNotes = filteredNotes.filter(note => 
        note.tags.some(tag => activeTagIds.includes(tag.id))
      );
    }
    
    if (activeContentTypes.length > 0) {
      filteredNotes = filteredNotes.filter(note => 
        activeContentTypes.includes(note.contentType)
      );
    }
    
    // If no notes after filtering, return empty graph
    if (filteredNotes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }
    
    // Generate the appropriate layout
    let graphData;
    
    switch (layout) {
      case 'circular':
        graphData = generateCircularLayout(filteredNotes);
        break;
      case 'tree':
        graphData = generateTreeLayout(filteredNotes);
        break;
      case 'force':
      default:
        graphData = generateForceDirectedLayout(filteredNotes);
        break;
    }
    
    // Update nodes with preview flag
    const nodesWithPreview = graphData.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        showPreview: showPreviews
      }
    }));
    
    // Filter out mention edges if showMentions is false
    const filteredEdges = showMentions 
      ? graphData.edges 
      : graphData.edges.filter(edge => edge.data?.type !== 'mention');
    
    setNodes(nodesWithPreview);
    setEdges(filteredEdges);
    
    // We'll use fitView after everything is rendered
    setTimeout(() => {
      try {
        reactFlowInstance.fitView({ padding: 0.2 });
      } catch (error) {
        console.log('Error with fit view:', error);
      }
    }, 100);
  }, [notes, layout, activeTagIds, activeContentTypes, showPreviews, showMentions, reactFlowInstance]);
  
  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };
  
  const handleOpenNote = () => {
    if (selectedNode) {
      navigate(`/?noteId=${selectedNode.id}`);
    }
  };
  
  const handleTagToggle = (tagId: string) => {
    setActiveTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  const handleContentTypeToggle = (type: string) => {
    setActiveContentTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleZoomIn = () => {
    reactFlowInstance.zoomIn();
  };

  const handleZoomOut = () => {
    reactFlowInstance.zoomOut();
  };

  const handleFitView = () => {
    reactFlowInstance.fitView({ padding: 0.2 });
  };

  const handleClearFilters = () => {
    setActiveTagIds([]);
    setActiveContentTypes([]);
  };
  
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
          <h1 className="text-xl font-bold">Knowledge Graph</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={layout} onValueChange={(value) => value && setLayout(value as LayoutType)}>
            <ToggleGroupItem value="force" aria-label="Force-Directed" className="flex items-center gap-1">
              <NetworkIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Network</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="circular" aria-label="Circular" className="flex items-center gap-1">
              <Radar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clusters</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="tree" aria-label="Tree" className="flex items-center gap-1">
              <FolderTree className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Hierarchy</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r p-4 flex flex-col">
          <Tabs defaultValue="tags" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="types">Types</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters}
                className="text-xs h-7 px-2 flex items-center gap-1"
                disabled={activeTagIds.length === 0 && activeContentTypes.length === 0}
              >
                <Trash className="h-3 w-3" />
                <span>Clear filters</span>
              </Button>
              
              <Badge variant="outline" className="h-6">
                {nodes.length} notes
              </Badge>
            </div>
            
            <TabsContent value="tags" className="pt-0 mt-0">
              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
                {tags.map(tag => (
                  <div
                    key={tag.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      activeTagIds.includes(tag.id) ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <span className="text-sm">{tag.name}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="types" className="pt-0 mt-0">
              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
                {Object.entries(NODE_TYPES).map(([type, label]) => (
                  <div
                    key={type}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      activeContentTypes.includes(type) ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleContentTypeToggle(type)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: contentTypeColors[type as keyof typeof contentTypeColors] }}
                    ></div>
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-previews"
                checked={showPreviews}
                onCheckedChange={setShowPreviews}
              />
              <Label htmlFor="show-previews">Show note previews</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-mentions"
                checked={showMentions}
                onCheckedChange={setShowMentions}
              />
              <Label htmlFor="show-mentions">Show mentions</Label>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex-1 overflow-auto">
            <div className="text-sm font-medium mb-2">Legend</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-foreground"></div>
                <span>Direct connection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-foreground opacity-50 border-dashed"></div>
                <span>Mention</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {selectedNode && (
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Selected Note</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedNode.data.tags && selectedNode.data.tags.map((tag: Tag) => (
                      <Badge 
                        key={tag.id} 
                        style={{ backgroundColor: tag.color }}
                        className="text-white text-xs"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-sm font-medium mb-2">{selectedNode.data.title}</div>
                  
                  <div className="flex text-xs text-muted-foreground gap-4 mb-4">
                    <div className="flex-1 flex items-center gap-1">
                      <NetworkIcon className="h-3 w-3" />
                      <span>{selectedNode.data.connections}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      <span>{selectedNode.data.mentions}</span>
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full" onClick={handleOpenNote}>
                    Open Note
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { strokeWidth: 2 }
            }}
          >
            <Background color="#aaa" gap={16} size={1} />
            <Panel position="top-right" className="bg-card p-2 rounded shadow-md flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={handleZoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={handleZoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={handleFitView}>
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fit View</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Panel>
            
            <Panel position="bottom-left">
              <MiniMap 
                nodeColor={(node) => {
                  const nodeTags = (node.data?.tags || []) as Tag[];
                  return nodeTags.length > 0 ? nodeTags[0].color : contentTypeColors[node.data?.contentType as keyof typeof contentTypeColors] || '#cccccc';
                }}
                maskColor="rgba(240, 240, 240, 0.6)"
                className="bg-card/95 border rounded shadow-md"
              />
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </>
  );
};

// Main component that wraps the Flow with the Provider
const KnowledgeGraph = () => {
  return (
    <div className="flex flex-col h-full">
      <ReactFlowProvider>
        <KnowledgeGraphFlow />
      </ReactFlowProvider>
    </div>
  );
};

export default KnowledgeGraph;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuickCaptureButton from '@/components/QuickCaptureButton';
import CaptureDialog from '@/components/CaptureDialog';
import NotesList from '@/components/NotesList';
import Collections from '@/components/Collections';
import TagManager from '@/components/TagManager';
import DataExportImport from '@/components/DataExportImport';
import NoteView from '@/components/NoteView';
import SearchPanel from '@/components/SearchPanel';
import { Note, useNotes } from '@/contexts/NotesContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Brain, Search, Network, Tag, ListFilter, Clock, Sparkles, BookOpen, Palette, Bookmark, PenTool, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardConte\ant, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Index = () => {
  const [captureDialogOpen, setCaptureDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);


import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/contexts/NotesContext';
import { Download, Upload, Database } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import DemoDataLoader from './DemoDataLoader';

const DataExportImport: React.FC = () => {
  const { exportNotes, importNotes } = useNotes();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleExport = () => {
    exportNotes();
    toast({
      title: "Export Started",
      description: "Your notes are being prepared for download as Markdown files.",
    });
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        await importNotes(e.target.files);
        toast({
          title: "Import Successful",
          description: `Imported ${e.target.files.length} note(s).`,
        });
        setDialogOpen(false);
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "There was an error importing your notes.",
          variant: "destructive"
        });
      }
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex w-full items-center justify-start"
        onClick={() => setDialogOpen(true)}
      >
        <Database className="mr-2 h-4 w-4" />
        <span>Data Management</span>
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Your Data</DialogTitle>
            <DialogDescription>
              Export your notes as Markdown files or import from existing Markdown files.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 my-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Local-First Storage</h3>
              <p className="text-sm text-muted-foreground">
                Your notes are stored locally on your device as Markdown files, 
                making them portable and ensuring data ownership.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Metadata Database</h3>
              <p className="text-sm text-muted-foreground">
                Tag relationships, links, and other metadata are managed efficiently 
                in a local database for fast searching and organization.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Demo Data</h3>
              <p className="text-sm text-muted-foreground">
                Load sample notes to explore the features of this application 
                without having to create content from scratch.
              </p>
              <DemoDataLoader />
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleExport} 
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="h-4 w-4" />
              Export Notes
            </Button>
            
            <Button
              onClick={handleImportClick}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-950"
            >
              <Upload className="h-4 w-4" />
              Import Notes
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFiles}
                accept=".md"
                multiple
                className="hidden"
              />
            </Button>
          </div>

          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)} 
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataExportImport;

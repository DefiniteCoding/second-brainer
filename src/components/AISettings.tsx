import React, { useState } from 'react';
import { hasApiKey, setApiKey, getApiKey } from '@/services/ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AISettingsProps {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
}

const AISettings: React.FC<AISettingsProps> = ({ open = false, onOpenChange }) => {
  const [apiKey, setApiKeyState] = useState<string>(getApiKey() || '');
  const { toast } = useToast();

  const handleSave = () => {
    setApiKey(apiKey.trim());
    onOpenChange(false);
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>
            Configure the AI features by providing your Google Gemini API key.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="api-key" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Gemini API Key
            </label>
            <div className="relative">
              <Key className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Gemini API key"
                className="pl-10"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from the <a href="https://ai.google.dev/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISettings;

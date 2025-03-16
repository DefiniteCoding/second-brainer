
import React, { useState } from 'react';
import { hasApiKey, setApiKey, getApiKey } from '@/utils/aiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, Save, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AISettingsProps {
  onSave?: () => void;
}

const AISettings: React.FC<AISettingsProps> = ({ onSave }) => {
  const [apiKey, setApiKeyState] = useState<string>(getApiKey() || '');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSave = () => {
    setApiKey(apiKey.trim());
    setIsOpen(false);
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved",
    });
    if (onSave) onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex w-full items-center justify-start"
          title="AI Settings"
        >
          <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
          <span>AI Settings</span>
        </Button>
      </DialogTrigger>
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISettings;

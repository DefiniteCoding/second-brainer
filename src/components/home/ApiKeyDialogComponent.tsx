
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { GeminiService } from '@/services/gemini';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ApiKeyDialogComponent: React.FC<ApiKeyDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}) => {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Gemini API key",
        variant: "destructive"
      });
      return;
    }

    try {
      const isValid = await GeminiService.validateApiKey(apiKey);
      if (isValid) {
        GeminiService.saveApiKey(apiKey);
        if (onSuccess) onSuccess();
        onOpenChange(false);
        toast({
          title: "Success",
          description: "API key saved successfully"
        });
      } else {
        toast({
          title: "Invalid API Key",
          description: "The provided API key is invalid",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate API key",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Gemini API Key</DialogTitle>
          <DialogDescription>
            AI search requires a Google Gemini API key to work. 
            You can get one for free from the Google AI Studio.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Enter your Gemini API key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveApiKey}>
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialogComponent;

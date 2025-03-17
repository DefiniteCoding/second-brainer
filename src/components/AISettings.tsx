
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { hasApiKey, setApiKey, removeApiKey } from '@/services/ai';
import { BrainCircuit, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface AISettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AISettings: React.FC<AISettingsProps> = ({ open, onOpenChange }) => {
  const [apiKey, setApiKeyValue] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if API key exists on component mount
  useEffect(() => {
    setHasKey(hasApiKey());
  }, [open]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Gemini API key.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await setApiKey(apiKey);
      setHasKey(true);
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved successfully.",
      });
      setApiKeyValue('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveKey = async () => {
    setIsLoading(true);
    try {
      removeApiKey();
      setHasKey(false);
      toast({
        title: "API Key Removed",
        description: "Your Gemini API key has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove API key. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <span>AI Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border rounded-md p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Gemini API Key</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Required for AI features like summarization and keyword extraction
                </p>
              </div>
              {hasKey && (
                <div className="flex items-center text-green-500 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Connected</span>
                </div>
              )}
            </div>
            
            {!hasKey && (
              <div className="space-y-2">
                <Input
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                  type="password"
                />
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    You can get a Gemini API key from{" "}
                    <a 
                      href="https://ai.google.dev/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          {hasKey ? (
            <Button 
              variant="destructive" 
              onClick={handleRemoveKey}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove API Key"
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleSaveKey}
              disabled={isLoading || !apiKey.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save API Key"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISettings;

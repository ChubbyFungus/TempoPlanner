import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { saveFloorplan, loadFloorplan, listFloorplans } from '@/lib/floorplanManager';
import { CanvasElement } from '@/types/shared';
import { Save, FolderOpen, Trash2 } from 'lucide-react';

interface SaveLoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: (elements: CanvasElement[]) => void;
  currentElements: CanvasElement[];
}

export const SaveLoadDialog: React.FC<SaveLoadDialogProps> = ({
  open,
  onOpenChange,
  onLoad,
  currentElements,
}) => {
  const [mode, setMode] = useState<'save' | 'load'>('save');
  const [floorplanName, setFloorplanName] = useState('');
  const [savedFloorplans, setSavedFloorplans] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSavedFloorplans(listFloorplans());
    }
  }, [open]);

  const handleSave = async () => {
    try {
      if (!floorplanName.trim()) {
        setError('Please enter a name for your floorplan');
        return;
      }
      await saveFloorplan(currentElements, floorplanName);
      setSavedFloorplans(listFloorplans());
      setFloorplanName('');
      setError(null);
    } catch (err) {
      setError('Failed to save floorplan');
    }
  };

  const handleLoad = async (name: string) => {
    try {
      const elements = await loadFloorplan(name);
      onLoad(elements);
      onOpenChange(false);
      setError(null);
    } catch (err) {
      setError('Failed to load floorplan');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'save' ? 'Save Floorplan' : 'Load Floorplan'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'save'
              ? 'Save your current floorplan design'
              : 'Load a previously saved floorplan'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === 'save' ? 'default' : 'outline'}
            onClick={() => setMode('save')}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            variant={mode === 'load' ? 'default' : 'outline'}
            onClick={() => setMode('load')}
            className="flex-1"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Load
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}

        {mode === 'save' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="floorplanName">Floorplan Name</Label>
              <Input
                id="floorplanName"
                value={floorplanName}
                onChange={(e) => setFloorplanName(e.target.value)}
                placeholder="Enter a name for your floorplan"
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              Save Floorplan
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {savedFloorplans.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No saved floorplans found
                </div>
              ) : (
                savedFloorplans.map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50"
                  >
                    <span className="font-medium">{name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoad(name)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          localStorage.removeItem(`floorplan-${name}`);
                          setSavedFloorplans(listFloorplans());
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}; 
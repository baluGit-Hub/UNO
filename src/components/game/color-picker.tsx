"use client";

import { type CardColor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: CardColor) => void;
}

const colors: Exclude<CardColor, "Wild">[] = ["Red", "Green", "Blue", "Yellow"];
const colorClasses = {
    Red: "bg-red-500 hover:bg-red-600",
    Green: "bg-green-500 hover:bg-green-600",
    Blue: "bg-blue-500 hover:bg-blue-600",
    Yellow: "bg-yellow-400 hover:bg-yellow-500",
  };
  
export function ColorPicker({ isOpen, onClose, onSelectColor }: ColorPickerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose a Color</DialogTitle>
          <DialogDescription>
            Select the color you want to change to for the next turn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {colors.map(color => (
            <Button
              key={color}
              onClick={() => onSelectColor(color)}
              className={cn("h-24 text-2xl font-bold", colorClasses[color])}
            >
              {color}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

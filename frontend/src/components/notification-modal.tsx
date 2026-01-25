"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NotificationModalProps } from "@/types/components.types";

export function NotificationModal({
  open,
  onClose,
  type,
  title,
  message,
  action,
  autoClose = 0,
}: NotificationModalProps) {
  useEffect(() => {
    if (open && autoClose > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [open, autoClose, onClose]);

  const iconMap = {
    success: <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />,
    error: <XCircle className="w-6 h-6 text-destructive" />,
    warning: <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    info: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
  };

  const colorMap = {
    success: "border-green-500/20 bg-green-500/5",
    error: "border-destructive/20 bg-destructive/5",
    warning: "border-amber-500/20 bg-amber-500/5",
    info: "border-blue-500/20 bg-blue-500/5",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className={`p-2 rounded-lg ${colorMap[type]}`}>
              {iconMap[type]}
            </div>
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="pt-3 text-base text-foreground">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-6">
          {action && (
            <Button onClick={action.onClick} variant="default" size="default">
              {action.label}
            </Button>
          )}
          <Button onClick={onClose} variant="outline" size="default">
            {action ? "Close" : "OK"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

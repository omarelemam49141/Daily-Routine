"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SimpleModal({
  open,
  title,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-t-3xl border border-teal-200/50 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-zinc-950 sm:rounded-3xl",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-black text-teal-950 dark:text-white">{title}</h2>
          <Button variant="ghost" size="icon" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

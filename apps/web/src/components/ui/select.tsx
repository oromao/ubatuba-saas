"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
}

const SelectContext = React.createContext<SelectContextValue>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
  contentId: "",
});

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
}

function Select({ value = "", onValueChange = () => {}, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const contentId = React.useId();
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, contentId }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

function SelectTrigger({ className, children, id, ...props }: SelectTriggerProps) {
  const { open, setOpen, contentId } = React.useContext(SelectContext);
  return (
    <button
      id={id}
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      aria-controls={contentId}
      aria-expanded={open}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <span className="ml-2 opacity-60">▾</span>
    </button>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);
  return <span>{value || <span className="text-on-surface-muted">{placeholder}</span>}</span>;
}

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen, contentId } = React.useContext(SelectContext);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div
        id={contentId}
        role="listbox"
        className={cn(
          "absolute z-50 mt-1 w-full rounded-md border bg-surface shadow-lg",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function SelectItem({ value, children, className }: SelectItemProps) {
  const { onValueChange, setOpen, value: selectedValue } = React.useContext(SelectContext);
  return (
    <div
      role="option"
      aria-selected={selectedValue === value}
      className={cn(
        "cursor-pointer px-3 py-2 text-sm hover:bg-surface-variant",
        selectedValue === value && "bg-primary/10 font-medium",
        className
      )}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
    >
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };

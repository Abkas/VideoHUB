import React from "react";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = "Yes", cancelText = "No" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-2 text-center">{title}</h2>
        <p className="text-sm text-muted-foreground mb-4 text-center">{message}</p>
        <div className="flex gap-3 w-full justify-center">
          <button
            className="px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className="px-4 py-2 rounded bg-secondary text-foreground font-medium hover:opacity-80 transition"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

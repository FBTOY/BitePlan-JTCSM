"use client";

import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

interface Props {
  message: string;
  visible: boolean;
  onClose: () => void;
}

export default function Toast({ message, visible, onClose }: Props) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed right-4 top-4 z-50">
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-medium text-green-800 shadow-lg">
        <CheckCircle size={16} />
        {message}
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-green-600 hover:text-green-900"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

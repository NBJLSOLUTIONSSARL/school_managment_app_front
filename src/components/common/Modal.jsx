import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      
      <div
        className="fixed inset-0 bg-[#16222F]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border border-[#EFECE6] p-6 sm:p-8 z-10 my-8 transform transition-all animate-in fade-in zoom-in-95`}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#F4EDE2]">
          <div>
            <h3 className="text-xl font-bold font-serif-title text-[#16222F]">{title}</h3>
            {subtitle && <p className="text-sm text-[#78716C] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#A8A29E] hover:text-[#16222F] p-1.5 rounded-full hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

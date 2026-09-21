import React from 'react';
import { DoubtSolverView } from './DoubtSolverView';

interface DoubtBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: {
    doubt?: string;
    topic?: string;
    subject?: string;
    exam?: string;
  };
  userExam?: string;
}

export const DoubtBotModal: React.FC<DoubtBotModalProps> = ({
  isOpen,
  onClose,
  initialContext,
  userExam
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-6xl h-[94vh] sm:h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-900">
        <DoubtSolverView
          initialExam={initialContext?.exam || userExam || 'NEET (UG)'}
          initialContext={initialContext}
          onClose={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
};

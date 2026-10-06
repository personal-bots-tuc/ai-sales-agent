import { useState, type FormEvent } from 'react';

interface ChatDockProps {
  showPeekBar: boolean;
  itemCount: number;
  total: number;
  isTyping: boolean;
  order: {
    publicCode: string;
    total: number;
    items: Array<{ name: string; quantity: number; subtotal: number }>;
  } | null;
  onExpand: () => void;
  onSend: (_text: string) => void;
}

export const ChatDock = ({
  showPeekBar,
  itemCount,
  total,
  isTyping,
  order,
  onExpand,
  onSend,
}: ChatDockProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      onSend(input.trim());
      setInput('');
    }
  };

  if (order) return null;

  return (
    <footer className="bg-white border-t border-neutral-200 px-4 py-3">
      <div className="max-w-md mx-auto">
        {showPeekBar && (
          <button
            onClick={onExpand}
            className="w-full mb-3 py-2 bg-primary-50 border border-primary-200 rounded-xl text-primary-700 text-sm font-medium flex items-center justify-center gap-2"
          >
            <span className="material-icons text-base">shopping_cart</span>
            <span>
              {itemCount} items · ${total.toLocaleString()}
            </span>
          </button>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isTyping ? 'El asistente está escribiendo...' : 'Escribí tu mensaje...'}
            disabled={isTyping}
            className="flex-1 px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-icons">send</span>
          </button>
        </form>
      </div>
    </footer>
  );
};

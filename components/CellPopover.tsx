interface CellPopoverProps {
  link: string;
  position: { x: number; y: number };
  isVisible: boolean;
  onLinkClick: (link: string) => void;
  onClose: () => void;
}

export function CellPopover({ link, position, isVisible, onLinkClick, onClose }: CellPopoverProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute z-50 bg-white shadow-lg rounded-lg p-4 max-w-sm"
      style={{ 
        top: position.y + 10, 
        left: position.x + 10 
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold">Link:</div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      <div className="break-all">
        <button 
          onClick={() => onLinkClick(link)}
          className="text-blue-500 hover:underline cursor-pointer"
        >
          {link}
        </button>
      </div>
    </div>
  );
} 
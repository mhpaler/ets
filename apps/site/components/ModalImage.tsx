import { type KeyboardEvent, useState } from "react";

interface ModalImageProps {
  src: string;
  alt: string;
}

export default function ModalImage({ src, alt }: ModalImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      setIsOpen(true);
    }
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div
        className="group relative inline-block cursor-pointer"
        onClick={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        <img src={src} alt={alt} className="hover:opacity-90 transition-opacity" />
        <span className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm transition-all duration-200 z-[100]">
          View Image
        </span>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img src={src} alt={alt} className="max-w-full max-h-[90vh] object-contain" />
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import { useModal } from "@app/hooks/useModalContext"; // Ensure this path is correct
import { Dialog, Transition } from "@headlessui/react";
import type React from "react";
import { Fragment, useEffect } from "react";

interface Props {
  id: string;
  label?: string;
  link?: boolean;
  disabled?: boolean;
  buttonClasses?: string;
  onModalOpen?: () => void;
  children: React.ReactNode;
}

const Modal = ({ id, label, children, link = false, buttonClasses = "", disabled = false, onModalOpen }: Props) => {
  const { currentModal, openModal, resetModal } = useModal();

  useEffect(() => {
    // resetModal() is called on unmount.
    return () => {
      if (currentModal === id) {
        resetModal();
      }
    };
  }, [currentModal, id, resetModal]);

  const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    openModal(id);
    if (onModalOpen) {
      onModalOpen();
    }
  };

  const buttonClassName = link ? "btn btn-link" : "btn";
  const disabledClass = disabled ? "btn-disabled" : "";

  return (
    <>
      <div className="flex justify-center">
        <button
          onClick={handleOpenModal}
          className={`${buttonClassName} ${disabledClass} ${buttonClasses}`}
          disabled={disabled}
        >
          {label}
        </button>
      </div>

      <Transition appear show={currentModal === id} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export { Modal };

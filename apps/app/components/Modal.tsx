import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { CloseModalProvider } from "@app/context/CloseModalContext"; // Adjust path as necessary

interface Props {
  label?: string;
  link?: boolean;
  disabled?: boolean;
  buttonClasses?: string;
  onModalOpen?: () => void;
  children?: any;
}

const Modal = ({ label, children, link = false, buttonClasses = "", disabled = false, onModalOpen }: Props) => {
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
    if (onModalOpen) {
      onModalOpen(); // Call the onModalOpen function from props if provided
    }
  }

  const handleClick = () => {
    if (!disabled) {
      openModal();
    }
  };

  const buttonClassName = link ? "btn btn-link" : "btn";
  const disabledClass = disabled ? "btn-disabled" : "";
  return (
    <>
      <button
        onClick={handleClick}
        className={`${buttonClassName} ${disabledClass} ${buttonClasses}`}
        disabled={disabled}
      >
        {label}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
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
              <CloseModalProvider value={{ closeModal }}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    {children}
                  </Dialog.Panel>
                </Transition.Child>
              </CloseModalProvider>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export { Modal };

interface Props {
  label?: string;
  link?: boolean;
  children?: any;
}

const Modal2 = ({ link = false }: Props) => {
  const buttonClassName = link ? "btn btn-link" : "btn btn-sm btn-primary btn-outline";

  const openModal = () => {
    const modal = document.getElementById("my_modal_2");
    if (modal instanceof HTMLDialogElement) {
      // Check if modal is not null and is a dialog element
      modal.showModal();
    } else {
      console.error("Modal element not found or not a dialog");
    }
  };

  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button className={buttonClassName} onClick={openModal}>
        open modal
      </button>
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">Press ESC key or click outside to close</p>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export { Modal2 };

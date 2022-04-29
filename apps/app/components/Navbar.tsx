import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

const Navbar = () => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="mx-4">
        <div className="flex items-center justify-between max-w-6xl pt-4 mx-auto mb-4 space-x-4">
          <Link href="/">
            <a>
              <svg fill="currentColor" className="h-10 text-slate-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 294 100">
                <path d="M129.1 16.2h45.7v10.3h-34v17.3h33.3v10.3h-33.3v18.5h34v10.3h-45.7V16.2zm73.6 10.3h-20.2V16.2h52.1v10.3h-20.2v56.4h-11.7V26.5zm43.5 38c4.6 4.9 11.8 9.2 21.1 9.2 9.6 0 13.4-4.7 13.4-9.1 0-6-7.1-7.8-15.2-9.9-10.9-2.7-23.7-5.9-23.7-20 0-11 9.7-19.5 24.3-19.5 10.4 0 18.8 3.3 25 9.3l-6.7 8.7c-5.2-5.2-12.3-7.6-19.3-7.6-6.9 0-11.3 3.3-11.3 8.3 0 5.2 6.8 6.9 14.7 8.9 11 2.8 24.1 6.2 24.1 20.7 0 11.1-7.8 20.6-25.8 20.6-12.3 0-21.2-4.3-27.1-10.6l6.5-9zM0 49.7l50-50H0v50zm100 50v-50l-50 50h50zM50-.3l50 50v-50H50z" />
                <circle cx="14.9" cy="84.7" r="5" />
              </svg>
              <h1 className="sr-only">Ethereum Tag Service</h1>
            </a>
          </Link>

          <div>
            <button onClick={openModal} className="flex items-center justify-center px-8 py-3 text-base font-bold text-white transition-colors bg-pink-500 border border-transparent rounded-lg shadow-lg shadow-pink-500/30 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300">
              {t('connect-wallet')}
            </button>
          </div>
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-md shadow-slate-900">
                  <iframe className="w-full aspect-video" src="https://www.youtube.com/embed/EMldOiiG1Ko?controls=0&autoplay=1 " title="YouTube video player" frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center flex-grow w-full px-4 py-3 mt-6 font-bold text-pink-500 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50 hover:text-pink-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default Navbar;

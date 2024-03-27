import React, { useEffect, useState } from "react";

interface AlertProps {
  showAlert: boolean;
  title: string;
  description: string | JSX.Element;
  toggleAlert: () => void;
}

const Alert: React.FC<AlertProps> = ({ showAlert, title, description, toggleAlert }) => {
  const [shouldRender, setShouldRender] = useState(showAlert);

  useEffect(() => {
    if (showAlert) setShouldRender(true);
  }, [showAlert]);

  const onAnimationEnd = () => {
    if (!showAlert) setShouldRender(false);
  };

  return (
    shouldRender && (
      <div className="fixed bottom-0 inset-x-0 p-4 z-10 flex justify-center" onAnimationEnd={onAnimationEnd}>
        <div className="max-w-xs w-full" style={{ maxWidth: "400px" }}>
          <div
            className={`alert shadow-lg ${showAlert ? "animate-slideIn" : "animate-slideOut"} flex justify-between`}
            role="alert"
          >
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-info shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <h3 className="font-bold">{title}</h3>
                <div className="text-xs">{description}</div>
              </div>
            </div>
            <button className="btn btn-sm" onClick={toggleAlert}>
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Alert;

const NavFooter = () => {
  return (
    <footer className="p-4 lg:p-5">
      <div className="flex justify-left gap-4 mb-8">
        <a
          role="button"
          rel="noreferrer"
          target="_blank"
          href="https://ets.xyz/docs/faq#what-is-ets"
          className="link-primary text-sm"
        >
          What?
        </a>
        <a role="button" rel="noreferrer" target="_blank" href="https://ets.xyz" className="link-primary text-sm">
          Docs
        </a>
        <a role="button" rel="noreferrer" target="_blank" href="https://blog.ets.xyz" className="link-primary text-sm">
          Blog
        </a>
      </div>
      <div className="flex flex-col items-left gap-4">
        <div className="flex space-x-5 mb-4">
          <a
            href="https://github.com/ethereum-tag-service/ets"
            className="text-slate-600 hover:text-slate-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-6 h-6" width="100%" height="100%" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
              <title>GitHub</title>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            href="https://discord.gg/xCUz9FRcXD"
            className="text-slate-600 hover:text-slate-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="w-6 h-6"
              width="100%"
              height="100%"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 127.14 96.36"
            >
              <title>Discord</title>
              <g id="图层_2" data-name="图层 2">
                <g id="Discord_Logos" data-name="Discord Logos">
                  <g id="Discord_Logo_-_Large_-_White" data-name="Discord Logo - Large - White">
                    <path
                      d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
                      fill="currentColor"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </a>
          <a
            href="https://x.com/etsxyz"
            className="text-slate-600 hover:text-slate-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="w-5 h-5"
              width="100%"
              height="100%"
              viewBox="0 0 1200 1227"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>X</title>
              <path
                d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            href="https://warpcast.com/ets"
            className="text-slate-600 hover:text-slate-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="w-6 h-6"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Warpcast</title>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.92028 31.9901H24.0698C28.4371 31.9901 31.9901 28.4373 31.9901 24.0699V7.92053C31.9901 3.55319 28.4371 0.000137329 24.0698 0.000137329H7.92028C3.55304 0.000137329 0 3.55319 0 7.92053V24.0699C0 28.4373 3.55304 31.9901 7.92028 31.9901ZM19.4134 16.048L20.9908 10.124H25.1383L21.2924 23.2218H17.7062L15.9951 17.1397L14.284 23.2218H10.7055L6.85115 10.124H10.999L12.5915 16.0916L14.1891 10.124H17.8309L19.4134 16.048Z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
        <div>
          <p className="text-left text-xs text-slate-600">
            &copy; 2021-{new Date().getUTCFullYear()} Ethereum Tag Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default NavFooter;

import React from "react";
import './index.css';

/**
 * PortfolioSection – converted from provided HTML to React JSX.
 * 
 * NOTE:
 * - All `class` attributes have been renamed to `className`.
 * - `viewbox` → `viewBox` where needed.
 * - Invalid XML headers and self‑closing tags were fixed/removed.
 * - You can further refactor classes to Tailwind if desired.
 */

const PortfolioSection = () => (
  <section className="section full_sec">
    <div className="w-layout-hflex mainheader">
      <div className="headerbar">
        <div className="text-block-5">Model Link Porfolio</div>
        <a href="#">Login</a>
      </div>
      <div className="div-block">
        <div className="w-layout-hflex header_roles">
          {/* Photographers */}
          <a
            href="#"
            className="flex_wrapper flex_distribute link_block small_choice w-inline-block"
          >
            <div>Photographers</div>
            <div className="icon_24x24 w-embed">
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 18V8a1 1 0 0 1 1-1h1.5l1.707-1.707A1 1 0 0 1 8.914 5h6.172a1 1 0 0 1 .707.293L17.5 7H19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"
                ></path>
                <path
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                ></path>
              </svg>
            </div>
          </a>

          {/* Models */}
          <a
            href="#"
            className="flex_wrapper flex_distribute link_block small_choice w-inline-block"
          >
            <div>Models</div>
            <div className="icon_24x24 w-embed">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                color="#000000"
              >
                <path
                  d="M18 21H6C6 21 7.66042 16.1746 7.5 13C7.3995 11.0112 5.97606 9.92113 6.5 8C6.72976 7.15753 7.5 6 7.5 6C7.5 6 9 7 12 7C15 7 16.5 6 16.5 6C16.5 6 17.2702 7.15753 17.5 8C18.0239 9.92113 16.6005 11.0112 16.5 13C16.3396 16.1746 18 21 18 21Z"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M7.49988 6.00002V3"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M16.5 6.00002V3"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>
          </a>

          {/* Wardrobe Stylists */}
          <a
            href="#"
            className="flex_wrapper flex_distribute link_block small_choice w-inline-block"
          >
            <div>Waredrobe Stylists</div>
            <div className="icon_24x24 w-embed">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                color="#000000"
              >
                <path
                  d="M6 4H9C9 4 9 7 12 7C15 7 15 4 15 4H18M18 11V19.4C18 19.7314 17.7314 20 17.4 20H6.6C6.26863 20 6 19.7314 6 19.4L6 11"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M18 4L22.4429 5.77717C22.7506 5.90023 22.9002 6.24942 22.7772 6.55709L21.1509 10.6228C21.0597 10.8506 20.8391 11 20.5938 11H18"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M5.99993 4L1.55701 5.77717C1.24934 5.90023 1.09969 6.24942 1.22276 6.55709L2.84906 10.6228C2.94018 10.8506 3.1608 11 3.40615 11H5.99993"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>
          </a>

          {/* Hair Stylists */}
          <a
            href="#"
            className="flex_wrapper flex_distribute link_block small_choice w-inline-block"
          >
            <div>Hair Stylists</div>
            <div className="icon_24x24 w-embed">
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 9H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6m0-6v6m0-6 5.419-3.87A1 1 0 0 1 18 5.942v12.114a1 1 0 0 1-1.581.814L11 15m7 0a3 3 0 0 0 0-6M6 15h3v5H6v-5Z"
                ></path>
              </svg>
            </div>
          </a>

          {/* Makeup Artists */}
          <a
            href="#"
            className="flex_wrapper flex_distribute link_block small_choice w-inline-block"
          >
            <div>Makeup Artists</div>
            <div className="icon_24x24 w-embed">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                color="#000000"
              >
                <path
                  d="M19 12L5 21"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M5 3L5 12"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M19 3V12"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M5 12L19 21"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M4 12L20 12"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M5 4L19 4"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M5 7L19 7"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>
          </a>
        </div>

        <h2 className="home_headtxt">
          Your Portfolio+Link<br />
          Built For Business.
        </h2>

        <div className="w-layout-hflex flex-block-5">
          <div className="text_color_muted bio_link">modellinkportfolio.com/@</div>
        </div>
        <div className="spacing_48"></div>
      </div>
    </div>
  </section>
);

export default PortfolioSection;

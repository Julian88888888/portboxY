// HomeSection.jsx
import React from "react";

export default function HomeSection() {
  return (
    <section className="section">
      <div className="spacing_48" />

      <div className="w-layout-vflex flex-block-6">
        {/* ---------- “All Your Links” column ---------- */}
        <div className="div-block-2">
          <h1>All Your Links</h1>
          <div className="spacing_24" />

          {/* Social icon bar */}
          <div className="flex_wrapper flex_center home_profilelinks">
            {/* — Twitter / X — */}
            <a
              href="https://twitter.com/jmsbaduor"
              target="_blank"
              className="icon_wrapper w-inline-block"
            >
              <div className="icon_24x24 w-embed">
                <svg
                  className="w-[24px] h-[24px] text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13.795 10.533 20.68 2h-3.073l-5.255 6.517L7.69 2H1l7.806 10.91L1.47 22h3.074l5.705-7.07L15.31 22H22l-8.205-11.467Zm-2.38 2.95L9.97 11.464 4.36 3.627h2.31l4.528 6.317 1.443 2.02 6.018 8.409h-2.31l-4.934-6.89Z" />
                </svg>
              </div>
            </a>

            {/* — LinkedIn — */}
            <a
              href="https://www.linkedin.com/in/jmsbaduor/"
              target="_blank"
              className="icon_wrapper w-inline-block"
            >
              <div className="icon_24x24 w-embed">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                >
                  <image
                    xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAA..."
                    x="0"
                    y="0"
                    width="50"
                    height="50"
                  />
                </svg>
              </div>
            </a>

            {/* …repeat for every icon exactly as in your snippet … */}
          </div>

          <div className="spacing_24" />
          <p className="text_color_grey home_booktxt">
            Over 2500 Social Networks to choose from.
          </p>
        </div>

        {/* ---------- “Portfolio Book” column ---------- */}
        <div className="div-block-2">
          <h1>Portfolio Book</h1>
          <div className="spacing_24" />
          <img
            src="images/portfolioimg.png"
            loading="lazy"
            alt=""
          />
          <div className="spacing_24" />
          <p className="text_color_grey home_booktxt">Show your best work.</p>
        </div>

        {/* ---------- “Get Bookings” column ---------- */}
        <div className="div-block-2">
          <h1>Get Bookings</h1>
          <div className="content_wrapper">
            <div className="spacing_24" />
            <p className="text_color_grey home_booktxt">
              Currently available for
            </p>

            {/* Booking options */}
            <div className="w-layout-hflex flex-block-4">
              {/* Photoshoots */}
              <a
                href="#"
                className="flex_wrapper flex_distribute link_block small_choice home_choice w-inline-block"
              >
                <div>Photoshoots</div>
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
                    />
                    <path
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                </div>
              </a>

              {/* Acting */}
              <a
                href="#"
                className="flex_wrapper flex_distribute link_block small_choice home_choice w-inline-block"
              >
                <div>Acting</div>
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
                      d="M14 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm7 11-6-2V9l6-2v10Z"
                    />
                  </svg>
                </div>
              </a>

              {/* Runway */}
              <a
                href="#"
                className="flex_wrapper flex_distribute link_block small_choice home_choice w-inline-block"
              >
                <div>Runway</div>
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
                      d="M9 5h-.16667c-.86548 0-1.70761.28071-2.4.8L3.5 8l2 3.5L8 10v9h8v-9l2.5 1.5 2-3.5-2.9333-2.2c-.6924-.51929-1.5346-.8-2.4-.8H15M9 5c0 1.5 1.5 3 3 3s3-1.5 3-3M9 5h6"
                    />
                  </svg>
                </div>
              </a>

              {/* Promos */}
              <a
                href="#"
                className="flex_wrapper flex_distribute link_block small_choice home_choice w-inline-block"
              >
                <div>Promos</div>
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
                    />
                  </svg>
                </div>
              </a>
            </div>

            <p className="text_color_grey home_booktxt">
              Use a dedicated page for business
            </p>

            <a
              data-w-id="9d260232-f91b-e6b2-d062-397806a866d0"
              href="#"
              className="link_btn_large w-inline-block"
            />

            <p className="text_color_grey home_booktxt booktxt_bold">
              ALWAYS KEEP YOUR
            </p>
            <div className="spacing_4" />
            <p className="text_color_grey home_booktxt">
              Rates
              <br />
              Travel Dates
              <br />
              Availability
            </p>
            <div className="spacing_16" />
          </div>

          <p className="text_color_grey home_booktxt booktxt_bold">
            UP TO DATE.
          </p>
        </div>
      </div>

      <div className="spacing_48" />
    </section>
  );
}

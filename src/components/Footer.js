// FooterSection.jsx
import React from "react";

export default function FooterSection() {
  return (
    <div className="section footer_sec">
      <div className="content_wrapper content_align_center">
        <div className="spacing_24" />
        <div className="line_divider" />
        <div className="spacing_24" />

        <a href="#">Create A Free Model Link Portfolio</a>

        <div className="spacing_48" />

        {/* © Notice */}
        <div className="text_wrapper text_align_center">
          <p className="text_color_grey text_width_medium">
            <strong>©</strong>2025 Model Link Portfolio
          </p>
        </div>

        <div className="spacing_24" />

        {/* Icon row */}
        <div className="w-layout-hflex flex-block-7">
          {/* --- Logo 1 --- */}
          <div className="footer_icons w-embed">
            <svg width="125" height="38" viewBox="0 0 125 38" xmlns="http://www.w3.org/2000/svg">
              <image
                xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABZCAYAAACE5RmzAAAAAXNSR0IArs4c6QAAIABJREF..."
                x="0"
                y="0"
                width="125"
                height="38"
              />
            </svg>
          </div>

          {/* --- Logo 2 --- */}
          <div className="footer_icons w-embed">
            <svg width="125" height="38" viewBox="0 0 125 38" xmlns="http://www.w3.org/2000/svg">
              <image
                xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABZCAYAAACE5RmzAAAAAXNSR0IArs4c6QAAIABJREF..."
                x="0"
                y="0"
                width="125"
                height="38"
              />
            </svg>
          </div>

          {/* --- Instagram --- */}
          <div className="footer_icons w-embed">
            <svg
              className="w-[24px] h-[24px] text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* --- Twitter / X --- */}
          <div className="footer_icons w-embed">
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

          {/* --- Facebook --- */}
          <div className="footer_icons w-embed">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.2 2.875C12.9734 2.875 11.797 3.36228 10.9296 4.22963C10.0623 5.09699 9.575 6.27337 9.575 7.5V10.075H7.1C6.97574 10.075 6.875 10.1757 6.875 10.3V13.7C6.875 13.8243 6.97574 13.925 7.1 13.925H9.575V20.9C9.575 21.0243 9.67574 21.125 9.8 21.125H13.2C13.3243 21.125 13.425 21.0243 13.425 20.9V13.925H15.9219C16.0252 13.925 16.1152 13.8547 16.1402 13.7546L16.9902 10.3546C17.0257 10.2126 16.9183 10.075 16.7719 10.075H13.425V7.5C13.425 7.29446 13.5067 7.09733 13.652 6.95199C13.7973 6.80665 13.9945 6.725 14.2 6.725H16.8C16.9243 6.725 17.025 6.62426 17.025 6.5V3.1C17.025 2.97574 16.9243 2.875 16.8 2.875H14.2Z"
                fill="#070707"
              />
            </svg>
          </div>

          {/* --- YouTube --- */}
          <div className="footer_icons w-embed">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.989 4.89006C10.3247 4.62909 13.6756 4.62909 17.0113 4.89006L19.252 5.06536C20.5001 5.163 21.5211 6.0984 21.7274 7.33317C22.2436 10.4226 22.2436 13.5764 21.7274 16.6659C21.5211 17.9006 20.5001 18.836 19.252 18.9337L17.0113 19.109C13.6756 19.3699 10.3247 19.3699 6.989 19.109L4.7483 18.9337C3.50023 18.836 2.47921 17.9006 2.2729 16.6659C1.75669 13.5764 1.75669 10.4226 2.2729 7.33317C2.47921 6.0984 3.50023 5.163 4.7483 5.06536L6.989 4.89006ZM10.0001 14.4696V9.5294C10.0001 9.29621 10.2545 9.15217 10.4544 9.27215L14.5714 11.7423C14.7656 11.8588 14.7656 12.1402 14.5714 12.2567L10.4544 14.7269C10.2545 14.8469 10.0001 14.7028 10.0001 14.4696Z"
                fill="#070707"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

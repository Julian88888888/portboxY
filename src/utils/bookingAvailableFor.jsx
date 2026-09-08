import React from 'react';

/** Booking "Available For" options (dashboard tags + public profile). */
export const BOOKING_AVAILABLE_FOR_OPTIONS = [
  { id: 'photoshoots', label: 'Photo Shoot' },
  { id: 'video-shoot', label: 'Video Shoot' },
  { id: 'multimedia-shoot', label: 'Multimedia Shoot' },
  { id: 'promo', label: 'Promo' },
  { id: 'runway', label: 'Runway' },
  { id: 'event', label: 'Event' },
  { id: 'fitting', label: 'Fitting' },
  { id: 'live-art', label: 'Live Art' },
];

export const BOOKING_AVAILABLE_FOR_IDS = BOOKING_AVAILABLE_FOR_OPTIONS.map((o) => o.id);

export const BOOKING_AVAILABLE_FOR_LABELS = BOOKING_AVAILABLE_FOR_OPTIONS.reduce((acc, o) => {
  acc[o.id] = o.label;
  return acc;
}, {
  // Legacy stored ids
  acting: 'Acting',
  Photoshoots: 'Photo Shoot',
  Promos: 'Promo',
});

export const formatBookingAvailableForLabel = (id) =>
  BOOKING_AVAILABLE_FOR_LABELS[id] || String(id || '');

export function BookingAvailableForIcon({ type, color, size = 22 }) {
  const fill = color || 'currentColor';
  const common = {
    width: size,
    height: size,
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  };

  if (type === 'photoshoots') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path
          fill={fill}
          d="M3.5 3H5V1.8c0-.44.36-.8.8-.8h4.4c.44 0 .8.36.8.8V3h1.5A1.5 1.5 0 0 1 14 4.5V5h8v15h-8v.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 20.5v-16A1.5 1.5 0 0 1 3.5 3M18 7v2h2V7zm-4 0v2h2V7zm-4 0v2h2V7zm4 9v2h2v-2zm4 0v2h2v-2zm-8 0v2h2v-2z"
        />
      </svg>
    );
  }

  if (type === 'video-shoot' || type === 'acting') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path
          fill={fill}
          d="m20.84 2.18l-3.93.78l2.74 3.54l1.97-.4zm-6.87 1.36L12 3.93l2.75 3.53l1.96-.39zm-4.9.96l-1.97.41l2.75 3.53l1.96-.39zm-4.91 1l-.98.19a2 2 0 0 0-1.57 2.35L2 10l4.9-.97zM2 10v10a2 2 0 0 0 2 2h16c1.11 0 2-.89 2-2V10z"
        />
      </svg>
    );
  }

  if (type === 'multimedia-shoot') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path
          fill={fill}
          d="M9 13V5c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2v6h-3.43l-1.28-1.74a.14.14 0 0 0-.24 0L15.06 12c-.06.06-.18.07-.24 0l-1.43-1.75a.152.152 0 0 0-.23 0l-2.11 2.66c-.08.09-.01.24.11.24h6.34V15H11c-1.11 0-2-.89-2-2m-3 9v-1H4v1H2V2h2v1h2V2h2.39C7.54 2.74 7 3.8 7 5v8c0 2.21 1.79 4 4 4h4.7c-1.03.83-1.7 2.08-1.7 3.5c0 .53.11 1.03.28 1.5zM4 7h2V5H4zm0 4h2V9H4zm0 4h2v-2H4zm2 4v-2H4v2zm17-6v2h-2v5.5a2.5 2.5 0 0 1-5 0a2.5 2.5 0 0 1 3.5-2.29V13z"
        />
      </svg>
    );
  }

  if (type === 'promo') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path
          fill={fill}
          d="M20 22h-2v-5h2M6 22H4v-5h2M23 4v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2m-2 0H3v9h18m-1-7h-5v2h5m-2 1h-3v2h3m-4 0H4l2.73-3.64l2 2.73l.73-.54L8.2 7.82l1.71-2.27Z"
        />
      </svg>
    );
  }

  if (type === 'runway') {
    return (
      <svg {...common} viewBox="0 0 15 15">
        <path
          fill={fill}
          d="M9.38 1.96c0 .8-.7 1.46-1.57 1.46c-.86 0-1.56-.66-1.56-1.46c0-.81.7-1.46 1.56-1.46c.87 0 1.57.65 1.57 1.46M6.25 4h.94l5.31 3.79v.88h-.62L8.75 6.41v2.26L10 11l1.25 2.92l-.62.58H10l-1.25-2.92l-2.5-3.5V5.37L4.69 6.63L3.44 8.67H2.5v-.59l.94-1.75zm.53 6.07L5.33 14.5h-.64l-.63-.58l1.76-4.93z"
        />
      </svg>
    );
  }

  if (type === 'event') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path
          fill={fill}
          fillRule="evenodd"
          d="M10 5a3 3 0 1 1-6 0a3 3 0 0 1 6 0m7 3a3 3 0 1 0 0-6a3 3 0 0 0 0 6m-2 4a3 3 0 1 1-6 0a3 3 0 0 1 6 0m2.376 6.535l.32 1.205h.005a1 1 0 0 1-.965 1.26H7.28a1.002 1.002 0 0 1-.965-1.26l.32-1.205a2.745 2.745 0 0 1 2.655-2.04h5.43a2.75 2.75 0 0 1 2.655 2.04Zm5.318-5.795l-.32-1.205a2.75 2.75 0 0 0-2.655-2.04h-3.975a4.47 4.47 0 0 1 .285 4.5h5.705a1 1 0 0 0 .965-1.26zM4.284 9.5H8.26v.005a4.47 4.47 0 0 0-.285 4.5h-5.7a1.002 1.002 0 0 1-.965-1.26l.32-1.205A2.745 2.745 0 0 1 4.285 9.5Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (type === 'fitting') {
    return (
      <svg {...common} viewBox="0 0 512 512">
        <path
          fill={fill}
          d="M133.3 33.41L77.89 47.25L34.6 148.3l33.29 22.2l27.46-54.9l17.05 4.9l-15.07 150.1H245.2l9.2-87.9l.9-8.1h4.5l-5.4-54.1l17.1-4.9l27.4 54.9l33.3-22.2l-43.3-101.05l-55.4-13.84c-5.5 3.87-12.2 6.21-19.5 7.95c-9.4 2.21-20 3.24-30.6 3.24s-21.2-1.03-30.6-3.24c-7.3-1.74-14-4.07-19.5-7.95M271.5 192.6l-1.5 14h178.8l-1.5-14zm-3.4 32l-26.7 254h62.7l46.5-216.9h17.6l46.5 216.9h62.7l-26.7-254z"
        />
      </svg>
    );
  }

  if (type === 'live-art') {
    return (
      <svg {...common} viewBox="0 0 16 16">
        <path
          fill={fill}
          d="M8 1c-.554 0-1 .446-1 1s.446 1 1 1s1-.446 1-1s-.446-1-1-1M6.5 4c-.277 0-.5.223-.5.5v2c0 .277.223.5.5.5H7v4.5c0 .277.223.5.5.5h1c.277 0 .5-.223.5-.5V7h.5c.277 0 .5-.223.5-.5v-2c0-.277-.223-.5-.5-.5zm-1 9a.5.5 0 0 0-.5.5a.5.5 0 0 0 .5.5H6v.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V14h.5a.5.5 0 0 0 .5-.5a.5.5 0 0 0-.5-.5z"
        />
      </svg>
    );
  }

  // Fallback: Photo Shoot icon
  return (
    <svg {...common} viewBox="0 0 24 24">
      <path
        fill={fill}
        d="M3.5 3H5V1.8c0-.44.36-.8.8-.8h4.4c.44 0 .8.36.8.8V3h1.5A1.5 1.5 0 0 1 14 4.5V5h8v15h-8v.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 20.5v-16A1.5 1.5 0 0 1 3.5 3M18 7v2h2V7zm-4 0v2h2V7zm-4 0v2h2V7zm4 9v2h2v-2zm4 0v2h2v-2zm-8 0v2h2v-2z"
      />
    </svg>
  );
}

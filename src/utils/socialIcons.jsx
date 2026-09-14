import React from 'react';

/** Social platform icons (public profile + settings). */
export function SocialIcon({ platform, size = 24, color = 'currentColor' }) {
  const props = {
    width: size,
    height: size,
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  };
  const fill = color;

  switch (platform) {
    case 'instagram':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
          />
        </svg>
      );
    case 'onlyfans':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            d="M24 4.003h-4.015c-3.45 0-5.3.197-6.748 1.957a7.996 7.996 0 1 0 2.103 9.211c3.182-.231 5.39-2.134 6.085-5.173c0 0-2.399.585-4.43 0c4.018-.777 6.333-3.037 7.005-5.995M5.61 11.999A2.391 2.391 0 0 1 9.28 9.97a2.966 2.966 0 0 1 2.998-2.528h.008c-.92 1.778-1.407 3.352-1.998 5.263A2.392 2.392 0 0 1 5.61 12Zm2.386-7.996a7.996 7.996 0 1 0 7.996 7.996a7.996 7.996 0 0 0-7.996-7.996m0 10.394A2.399 2.399 0 1 1 10.395 12a2.396 2.396 0 0 1-2.399 2.398Z"
          />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02"
          />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            d="M6.443 4.381C7.84 4.25 9.637 4.25 11.96 4.25h.082c2.322 0 4.119 0 5.516.131c1.407.133 2.517.406 3.409 1.03c.928.65 1.377 1.511 1.587 2.607c.197 1.024.197 2.321.197 3.907v.15c0 1.586 0 2.883-.197 3.907c-.21 1.096-.659 1.957-1.587 2.607c-.892.624-2.002.897-3.41 1.03c-1.396.131-3.193.131-5.515.131h-.082c-2.322 0-4.119 0-5.516-.131c-1.407-.133-2.517-.406-3.409-1.03c-.928-.65-1.377-1.511-1.587-2.607c-.197-1.024-.197-2.321-.197-3.907v-.15c0-1.586 0-2.883.197-3.907c.21-1.096.659-1.957 1.587-2.607c.892-.624 2.002-.897 3.41-1.03m5.115 4.564a1.166 1.166 0 0 0-1.608.313c-.13.191-.2.418-.2.65v4.184a1.16 1.16 0 0 0 1.8.968l3.175-2.074a1.155 1.155 0 0 0 .008-1.931z"
          />
        </svg>
      );
    case 'twitch':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43Z"
          />
        </svg>
      );
    case 'vimeo':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            d="M22 7.42c-.09 1.95-1.45 4.62-4.08 8.02C15.2 19 12.9 20.75 11 20.75c-1.15 0-2.14-1.08-2.95-3.25c-.55-1.96-1.05-3.94-1.61-5.92c-.6-2.16-1.24-3.24-1.94-3.24c-.14 0-.66.32-1.56.95L2 8.07c1-.87 1.96-1.74 2.92-2.61c1.32-1.14 2.31-1.74 2.96-1.8c1.56-.16 2.52.92 2.88 3.2c.39 2.47.66 4 .81 4.6c.43 2.04.93 3.04 1.48 3.04c.42 0 1.05-.64 1.89-1.97q1.26-1.98 1.35-3.03q.18-1.71-1.35-1.71c-.48 0-.97.11-1.48.33c.98-3.23 2.86-4.8 5.63-4.71c2.06.06 3.03 1.4 2.91 4.01"
          />
        </svg>
      );
    case 'spotify':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6c-.15-.5.15-1 .6-1.15c3.55-1.05 9.4-.85 13.1 1.35c.45.25.6.85.35 1.3c-.25.35-.85.5-1.3.25m-.1 2.8c-.25.35-.7.5-1.05.25c-2.7-1.65-6.8-2.15-9.95-1.15c-.4.1-.85-.1-.95-.5s.1-.85.5-.95c3.65-1.1 8.15-.55 11.25 1.35c.3.15.45.65.2 1m-1.2 2.75c-.2.3-.55.4-.85.2c-2.35-1.45-5.3-1.75-8.8-.95c-.35.1-.65-.15-.75-.45c-.1-.35.15-.65.45-.75c3.8-.85 7.1-.5 9.7 1.1c.35.15.4.55.25.85M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
          />
        </svg>
      );
    case 'twitter':
    case 'x':
      return (
        <svg {...props} viewBox="0 0 256 256">
          <path
            fill={fill}
            d="m218.12 209.56l-61-95.8l59.72-65.69a12 12 0 0 0-17.76-16.14l-55.27 60.84l-37.69-59.21A12 12 0 0 0 96 28H48a12 12 0 0 0-10.12 18.44l61 95.8l-59.76 65.69a12 12 0 1 0 17.76 16.14l55.31-60.84l37.69 59.21A12 12 0 0 0 160 228h48a12 12 0 0 0 10.12-18.44M166.59 204L69.86 52h19.55l96.73 152Z"
          />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...props} viewBox="0 0 16 16">
          <path
            fill={fill}
            d="M8.3 1.01c.75-.01 1.5 0 2.25-.01c.05.89.36 1.8 1.01 2.43c.64.65 1.55.94 2.44 1.04v2.35c-.83-.03-1.66-.2-2.42-.56c-.33-.15-.63-.34-.93-.54c0 1.7 0 3.41-.01 5.1c-.04.82-.31 1.63-.78 2.3c-.75 1.12-2.06 1.85-3.4 1.87c-.82.05-1.65-.18-2.35-.6c-1.16-.69-1.98-1.97-2.1-3.33q-.03-.435 0-.87c.1-1.11.65-2.17 1.49-2.89c.95-.84 2.29-1.24 3.54-1c.01.86-.02 1.73-.02 2.59c-.57-.19-1.24-.13-1.74.22c-.37.24-.64.6-.79 1.02c-.12.3-.09.62-.08.94c.14.96 1.05 1.76 2.01 1.67c.64 0 1.26-.39 1.59-.94c.11-.19.23-.39.24-.62c.06-1.04.03-2.08.04-3.13c0-2.35 0-4.7.01-7.04"
          />
        </svg>
      );
    case 'snapchat':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            d="M12.206.793c.99 0 4.347.276 5.93 3.821c.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51c.075.045.203.09.401.09c.3-.016.659-.12 1.033-.301a1 1 0 0 1 .464-.104c.182 0 .359.029.509.09c.45.149.734.479.734.838q.022.674-1.213 1.168c-.089.029-.209.075-.344.119c-.45.135-1.139.36-1.333.81c-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014c.255.044.435.27.42.509a.6.6 0 0 1-.045.225c-.24.569-1.273.988-3.146 1.271c-.059.091-.12.375-.164.57c-.029.179-.074.36-.134.553c-.076.271-.27.405-.555.405h-.03a3 3 0 0 1-.538-.074a6 6 0 0 0-1.273-.135c-.3 0-.599.015-.913.074c-.6.104-1.123.464-1.723.884c-.853.599-1.826 1.288-3.294 1.288c-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288c-.599-.42-1.107-.779-1.707-.884a7 7 0 0 0-.928-.074c-.54 0-.958.089-1.272.149a3 3 0 0 1-.54.074c-.374 0-.523-.224-.583-.42c-.061-.192-.09-.389-.135-.567c-.046-.181-.105-.494-.166-.57c-1.918-.222-2.95-.642-3.189-1.226a.6.6 0 0 1-.055-.225a.496.496 0 0 1 .42-.509c3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869c-.195-.434-.884-.658-1.332-.809a2 2 0 0 1-.346-.119c-1.107-.435-1.257-.93-1.197-1.273c.09-.479.674-.793 1.168-.793c.146 0 .27.029.383.074c.42.194.789.3 1.104.3c.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"
          />
        </svg>
      );
    case 'cashapp':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            d="M23.59 3.475a5.1 5.1 0 0 0-3.05-3.05c-1.31-.42-2.5-.42-4.92-.42H8.36c-2.4 0-3.61 0-4.9.4a5.1 5.1 0 0 0-3.05 3.06C0 4.765 0 5.965 0 8.365v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 0 0 3.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 0 0 3.06-3.06c.41-1.3.41-2.5.41-4.9v-7.25c0-2.41 0-3.61-.41-4.91m-6.17 4.63l-.93.93a.5.5 0 0 1-.67.01a5 5 0 0 0-3.22-1.18c-.97 0-1.94.32-1.94 1.21c0 .9 1.04 1.2 2.24 1.65c2.1.7 3.84 1.58 3.84 3.64c0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 0 1-.48.39H9.63l-.09-.01a.5.5 0 0 1-.38-.59l.28-1.27a6.54 6.54 0 0 1-2.88-1.57v-.01a.48.48 0 0 1 0-.68l1-.97a.49.49 0 0 1 .67 0c.91.86 2.13 1.34 3.39 1.32c1.3 0 2.17-.55 2.17-1.42s-.88-1.1-2.54-1.72c-1.76-.63-3.43-1.52-3.43-3.6c0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 0 1 .48-.38h1.78l.1.01c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68"
          />
        </svg>
      );
    case 'paypal':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            d="M18.026 6.117c-.213 5.113-3.887 6.804-8.485 6.425c-.758 0-.894.778-.972 1.37c-.31 1.556-.398 3.305-.816 4.773h-3.45a.476.476 0 0 1-.496-.467c.632-4.14 1.312-8.29 1.944-12.44c.145-.924.3-1.847.437-2.77a.83.83 0 0 1 .408-.613a31 31 0 0 1 4.277-.117c2.819-.116 7.25-.048 7.153 3.84"
          />
          <path
            fill={fill}
            d="M18.678 8.061c2.497 1.41 1.526 5.356-.175 7.105a6.36 6.36 0 0 1-4.724 1.439a.784.784 0 0 0-.768.826l-.583 3.625a.73.73 0 0 1-.33.554a18.6 18.6 0 0 1-3.383.107a.417.417 0 0 1-.428-.486c.078-.534.166-1.03.253-1.506a44 44 0 0 1 1.03-5.832a.84.84 0 0 1 .652-.292c.972 0 1.876 0 2.809-.058a5.99 5.99 0 0 0 5.598-5.472z"
          />
        </svg>
      );
    case 'amazon':
      return (
        <svg {...props} viewBox="0 0 16 16">
          <g fill={fill}>
            <path d="M10.813 11.968c.157.083.36.074.5-.05l.005.005a90 90 0 0 1 1.623-1.405c.173-.143.143-.372.006-.563l-.125-.17c-.345-.465-.673-.906-.673-1.791v-3.3l.001-.335c.008-1.265.014-2.421-.933-3.305C10.404.274 9.06 0 8.03 0C6.017 0 3.77.75 3.296 3.24c-.047.264.143.404.316.443l2.054.22c.19-.009.33-.196.366-.387c.176-.857.896-1.271 1.703-1.271c.435 0 .929.16 1.188.55c.264.39.26.91.257 1.376v.432q-.3.033-.621.065c-1.113.114-2.397.246-3.36.67C3.873 5.91 2.94 7.08 2.94 8.798c0 2.2 1.387 3.298 3.168 3.298c1.506 0 2.328-.354 3.489-1.54l.167.246c.274.405.456.675 1.047 1.166ZM6.03 8.431C6.03 6.627 7.647 6.3 9.177 6.3v.57c.001.776.002 1.434-.396 2.133c-.336.595-.87.961-1.465.961c-.812 0-1.286-.619-1.286-1.533M.435 12.174c2.629 1.603 6.698 4.084 13.183.997c.28-.116.475.078.199.431C13.538 13.96 11.312 16 7.57 16C3.832 16 .968 13.446.094 12.386c-.24-.275.036-.4.199-.299z" />
            <path d="M13.828 11.943c.567-.07 1.468-.027 1.645.204c.135.176-.004.966-.233 1.533c-.23.563-.572.961-.762 1.115s-.333.094-.23-.137c.105-.23.684-1.663.455-1.963c-.213-.278-1.177-.177-1.625-.13l-.09.009q-.142.013-.233.024c-.193.021-.245.027-.274-.032c-.074-.209.779-.556 1.347-.623" />
          </g>
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
          />
        </svg>
      );
    case 'website':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <g fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0m.6-3h16.8M3.6 15h16.8" />
            <path d="M11.5 3a17 17 0 0 0 0 18m1-18a17 17 0 0 1 0 18" />
          </g>
        </svg>
      );
    case 'email':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path
            fill={fill}
            fillRule="evenodd"
            d="m22 6.86l-10 5.775L2 6.86v-.11A2.755 2.755 0 0 1 4.75 4h14.5A2.755 2.755 0 0 1 22 6.75zM2 8.59l10 5.775v.005l10-5.775v8.65a2.755 2.755 0 0 1-2.75 2.75H4.75A2.755 2.755 0 0 1 2 17.245z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
}

export const SOCIAL_LINK_FIELDS = [
  { id: 'instagram', name: 'instagram', label: 'Instagram', placeholder: '@username' },
  { id: 'twitter', name: 'twitter', label: 'X', placeholder: '@username' },
  { id: 'facebook', name: 'facebook', label: 'Facebook', placeholder: 'facebook.com/...' },
  { id: 'youtube', name: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@...' },
  { id: 'tiktok', name: 'tiktok', label: 'TikTok', placeholder: '@username' },
  { id: 'twitch', name: 'twitch', label: 'Twitch', placeholder: 'twitch.tv/...' },
  { id: 'snapchat', name: 'snapchat', label: 'Snapchat', placeholder: '@username' },
  { id: 'linkedin', name: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
  { id: 'onlyfans', name: 'onlyfans', label: 'OnlyFans', placeholder: 'onlyfans.com/...' },
  { id: 'spotify', name: 'spotify', label: 'Spotify', placeholder: 'open.spotify.com/...' },
  { id: 'vimeo', name: 'vimeo', label: 'Vimeo', placeholder: 'vimeo.com/...' },
  { id: 'cashapp', name: 'cashapp', label: 'Cash App', placeholder: '$username' },
  { id: 'paypal', name: 'paypal', label: 'PayPal', placeholder: 'paypal.me/...' },
  { id: 'amazon', name: 'amazon', label: 'Amazon', placeholder: 'amazon.com/...' },
  { id: 'website', name: 'website', label: 'Website', placeholder: 'https://...' },
  { id: 'emailSocial', name: 'emailSocial', label: 'Email', placeholder: 'name@email.com' },
];

export const SOCIAL_PLATFORM_ORDER = SOCIAL_LINK_FIELDS.map((f) =>
  f.name === 'emailSocial' ? 'email' : f.name
);

export const emptySocialLinks = () =>
  SOCIAL_PLATFORM_ORDER.reduce((acc, key) => {
    acc[key] = '';
    return acc;
  }, {});

export const pickSocialLinks = (raw = {}) => {
  const out = emptySocialLinks();
  if (!raw || typeof raw !== 'object') return out;
  SOCIAL_PLATFORM_ORDER.forEach((key) => {
    if (key === 'twitter') {
      out.twitter = raw.twitter || raw.x || '';
      return;
    }
    if (key === 'email') {
      out.email = raw.email || raw.emailSocial || '';
      return;
    }
    out[key] = raw[key] || '';
  });
  return out;
};

export const socialLinksFromForm = (formData = {}) => {
  const out = emptySocialLinks();
  SOCIAL_PLATFORM_ORDER.forEach((key) => {
    if (key === 'email') {
      out.email = formData.emailSocial || '';
      return;
    }
    out[key] = formData[key] || '';
  });
  return out;
};

export const socialFormFieldsFromLinks = (links = {}) => {
  const picked = pickSocialLinks(links);
  return {
    instagram: picked.instagram,
    twitter: picked.twitter,
    facebook: picked.facebook,
    youtube: picked.youtube,
    tiktok: picked.tiktok,
    twitch: picked.twitch,
    snapchat: picked.snapchat,
    linkedin: picked.linkedin,
    onlyfans: picked.onlyfans,
    spotify: picked.spotify,
    vimeo: picked.vimeo,
    cashapp: picked.cashapp,
    paypal: picked.paypal,
    amazon: picked.amazon,
    website: picked.website,
    emailSocial: picked.email,
  };
};

/** Turn stored handle / URL / email into a clickable href. */
export const normalizeSocialUrl = (platform, value) => {
  if (!value || typeof value !== 'string') return '';
  const v = value.trim();
  if (!v) return '';

  if (platform === 'email') {
    const address = v.replace(/^mailto:/i, '').trim();
    return address ? `mailto:${address}` : '';
  }

  if (/^https?:\/\//i.test(v)) return v;
  if (platform === 'website') {
    return `https://${v.replace(/^\/\//, '')}`;
  }

  const handle = v.replace(/^@+/, '').replace(/^\/+/, '');
  const urls = {
    instagram: `https://www.instagram.com/${handle}`,
    twitter: `https://x.com/${handle}`,
    x: `https://x.com/${handle}`,
    facebook: `https://www.facebook.com/${handle}`,
    youtube: handle.includes('watch') || handle.includes('channel') || handle.includes('/')
      ? `https://www.youtube.com/${handle.replace(/^youtube\.com\//i, '')}`
      : `https://www.youtube.com/@${handle.replace(/^@/, '')}`,
    tiktok: `https://www.tiktok.com/@${handle.replace(/^@/, '')}`,
    twitch: `https://www.twitch.tv/${handle.replace(/^twitch\.tv\//i, '')}`,
    snapchat: `https://www.snapchat.com/add/${handle}`,
    linkedin: handle.startsWith('in/') ? `https://www.linkedin.com/${handle}` : `https://www.linkedin.com/in/${handle}`,
    onlyfans: `https://onlyfans.com/${handle}`,
    spotify: `https://open.spotify.com/user/${handle}`,
    vimeo: `https://vimeo.com/${handle.replace(/^vimeo\.com\//i, '')}`,
    cashapp: `https://cash.app/$${handle.replace(/^\$+/, '')}`,
    paypal: handle.includes('paypal.me') || handle.includes('/')
      ? `https://${handle.replace(/^https?:\/\//i, '')}`
      : `https://paypal.me/${handle}`,
    amazon: handle.includes('.')
      ? `https://${handle.replace(/^https?:\/\//i, '')}`
      : `https://www.amazon.com/s?k=${encodeURIComponent(handle)}`,
  };
  return urls[platform] || `https://${v}`;
};

export const listFilledSocialLinks = (raw) => {
  const picked = pickSocialLinks(raw);
  return SOCIAL_PLATFORM_ORDER
    .map((platform) => {
      const url = normalizeSocialUrl(platform, picked[platform]);
      return url ? { platform, url } : null;
    })
    .filter(Boolean);
};

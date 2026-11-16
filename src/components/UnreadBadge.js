import React from 'react';
import { formatUnreadCount } from '../hooks/useBookingUnread';
import './UnreadBadge.css';

/**
 * Small count circle for unread booking messages.
 */
export default function UnreadBadge({ count, className = '', title }) {
  const label = formatUnreadCount(count);
  if (!label) return null;

  return (
    <span
      className={`unread-badge ${className}`.trim()}
      title={title || `${label} unread`}
      aria-label={`${label} unread messages`}
    >
      {label}
    </span>
  );
}

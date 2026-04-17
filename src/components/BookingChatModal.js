import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import {
  getBookingMessages,
  sendBookingMessage,
  getGuestBookingMessages,
  sendGuestBookingMessage,
  formatBookingClientHandle
} from '../services/bookingsService';
import './BookingChat.css';

const BookingChatModal = ({ isOpen, onClose, booking }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const asClient = !!booking?.asClient;
  const clientEmail = (booking?.clientEmail || '').trim();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = (silent = false) => {
    if (!booking?.id) return;
    if (asClient && !clientEmail) {
      if (!silent) setError('Email required to load messages');
      return;
    }
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    const fetchMessages = asClient
      ? getGuestBookingMessages(booking.id, clientEmail)
      : getBookingMessages(booking.id);
    fetchMessages
      .then((result) => {
        if (result.success) {
          setMessages(result.data || []);
        } else {
          if (!silent) {
            setError(result.error || 'Failed to load messages');
            setMessages([]);
          }
        }
      })
      .catch((err) => {
        if (!silent) {
          setError(err.message || 'Failed to load messages');
          setMessages([]);
        }
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen && booking?.id) {
      if (asClient && !clientEmail) {
        setError('Your email is required to view this chat.');
        setMessages([]);
      } else {
        loadMessages();
      }
    } else {
      setMessages([]);
      setInputValue('');
      setError(null);
    }
  }, [isOpen, booking?.id, asClient, clientEmail]);

  useEffect(() => {
    if (!isOpen || !booking?.id || (asClient && !clientEmail)) return;
    const interval = setInterval(() => loadMessages(true), 5000);
    return () => clearInterval(interval);
  }, [isOpen, booking?.id, asClient, clientEmail]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || !booking?.id || sending) return;
    if (asClient && !clientEmail) {
      setError('Your email is required to send messages.');
      return;
    }

    setSending(true);
    setError(null);
    const result = asClient
      ? await sendGuestBookingMessage(booking.id, clientEmail, text)
      : await sendBookingMessage(booking.id, text);
    if (result.success) {
      setInputValue('');
      if (result.data && result.data.id) {
        setMessages((prev) => [...prev, result.data]);
      }
      loadMessages();
    } else {
      setError(result.error || 'Failed to send message');
    }
    setSending(false);
  };

  const handleClose = () => {
    if (!sending) {
      setInputValue('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const isSent = (msg) => (asClient ? msg.sender_type === 'client' : msg.sender_type === 'model');

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content booking-chat"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '100%' }}
      >
        <button
          type="button"
          className="modal-close"
          onClick={handleClose}
          disabled={sending}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <div className="booking-chat__header">
          <div className="booking-chat__header-main">
            {booking && (
              <p className="booking-chat__subtitle">
                {asClient
                  ? `Chat with ${booking.name || 'Model'}`
                  : `${booking.name} · ${formatBookingClientHandle(booking)}`}
                {booking.created_at && (
                  <span className="booking-chat__meta">
                    {' '}
                    {new Date(booking.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
                {!asClient && booking.email && (
                  <>
                    {' '}
                    <a
                      href={`mailto:${encodeURIComponent(booking.email)}?subject=${encodeURIComponent('Re: Your booking request')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="booking-chat__email-link"
                    >
                      Email client
                    </a>
                  </>
                )}
              </p>
            )}
            {(booking?.job_type || booking?.dates || booking?.location || booking?.pay_rate || booking?.details) && (
              <div className="booking-chat__booking-details">
                {booking.job_type && <div className="booking-chat__detail">Job Type: {booking.job_type}</div>}
                {booking.dates && <div className="booking-chat__detail">Dates: {booking.dates}</div>}
                {booking.location && <div className="booking-chat__detail">Location: {booking.location}</div>}
                {booking.pay_rate && <div className="booking-chat__detail">Pay Rate: {booking.pay_rate}</div>}
                {booking.details && <div className="booking-chat__detail booking-chat__detail--block">Details: {booking.details}</div>}
              </div>
            )}
          </div>
        </div>

        <div className="booking-chat__messages">
          {loading ? (
            <p className="booking-chat__state">Loading messages...</p>
          ) : error ? (
            <p className="booking-chat__state booking-chat__state--error">{error}</p>
          ) : messages.length === 0 ? (
            <p className="booking-chat__state booking-chat__state--empty">
              No messages yet. Send the first message.
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`booking-chat__message-wrap ${isSent(msg) ? '' : 'booking-chat__message-wrap--other'}`}
              >
                <div
                  className={`booking-chat__bubble ${isSent(msg) ? 'booking-chat__bubble--sent' : 'booking-chat__bubble--received'}`}
                >
                  {msg.body}
                </div>
                <div className="booking-chat__time">
                  {new Date(msg.created_at).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="booking-chat__form">
          <div className="booking-chat__form-row">
            <input
              type="text"
              className="booking-chat__input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              aria-label="Message"
            />
            <button
              type="submit"
              className="booking-chat__send"
              disabled={sending || !inputValue.trim()}
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingChatModal;

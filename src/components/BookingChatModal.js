import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { getBookingMessages, sendBookingMessage } from '../services/bookingsService';
import './BookingChat.css';

const BookingChatModal = ({ isOpen, onClose, booking }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = () => {
    if (!booking?.id) return;
    setLoading(true);
    setError(null);
    getBookingMessages(booking.id)
      .then((result) => {
        if (result.success) {
          setMessages(result.data || []);
        } else {
          setError(result.error || 'Failed to load messages');
          setMessages([]);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load messages');
        setMessages([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen && booking?.id) {
      loadMessages();
    } else {
      setMessages([]);
      setInputValue('');
      setError(null);
    }
  }, [isOpen, booking?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || !booking?.id || sending) return;

    setSending(true);
    setError(null);
    const result = await sendBookingMessage(booking.id, text);
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

  const isSent = (msg) => msg.sender_type === 'model';

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
          <div>
            <h3 className="booking-chat__title">Chat</h3>
            {booking && (
              <p className="booking-chat__subtitle">
                {booking.name} · {booking.email}
                {' '}
                <a
                  href={`mailto:${encodeURIComponent(booking.email)}?subject=${encodeURIComponent('Re: Your booking request')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="booking-chat__email-link"
                >
                  Email client
                </a>
              </p>
            )}
          </div>
          <button
            type="button"
            className="booking-chat__refresh"
            onClick={loadMessages}
            disabled={loading}
          >
            {loading ? '...' : 'Refresh'}
          </button>
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

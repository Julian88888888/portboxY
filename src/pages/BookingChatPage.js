import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getGuestBookingMessages, sendGuestBookingMessage } from '../services/bookingsService';
import '../components/BookingChat.css';

export default function BookingChatPage() {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(() => {
    try {
      const stored = sessionStorage.getItem(`booking_chat_email_${bookingId}`);
      return stored || emailFromUrl || '';
    } catch {
      return emailFromUrl || '';
    }
  });
  const [emailSubmitted, setEmailSubmitted] = useState(!!emailFromUrl);
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
    if (!bookingId || !email.trim() || !emailSubmitted) return;
    setLoading(true);
    setError(null);
    getGuestBookingMessages(bookingId, email.trim())
      .then((result) => {
        if (result.success) {
          setMessages(result.data || []);
          try {
            sessionStorage.setItem(`booking_chat_email_${bookingId}`, email.trim());
          } catch (_) {}
        } else {
          setError(result.error || 'Invalid email or booking');
          setEmailSubmitted(false);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load messages');
        setEmailSubmitted(false);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
  }, [bookingId, email, emailSubmitted]);

  useEffect(() => {
    if (emailFromUrl && emailFromUrl.trim()) {
      setEmail(emailFromUrl.trim());
      setEmailSubmitted(true);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailSubmitted(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || !bookingId || !email.trim() || sending) return;

    setSending(true);
    setError(null);
    const result = await sendGuestBookingMessage(bookingId, email.trim(), text);
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

  if (!bookingId) {
    return (
      <div className="booking-chat-invalid">
        <p>Invalid booking link.</p>
      </div>
    );
  }

  if (!emailSubmitted || !email.trim()) {
    return (
      <div className="section">
        <div className="booking-chat-gate">
          <h2 className="booking-chat-gate__title">Reply to your booking</h2>
          <p className="booking-chat-gate__desc">
            Enter the email address you used when you submitted the booking request.
          </p>
          <form onSubmit={handleEmailSubmit}>
            <input
              id="guest-email"
              type="email"
              className="booking-chat__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              aria-label="Your email"
            />
            {error && (
              <p className="booking-chat__state booking-chat__state--error" style={{ marginBottom: '12px' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="booking-chat-gate__submit"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isClientMessage = (msg) => msg.sender_type === 'client';

  return (
    <div className="section booking-chat-page">
      <div className="booking-chat booking-chat--page">
        <div className="booking-chat__header" style={{ background: 'transparent', borderBottom: 'none', paddingTop: 0 }}>
          <div className="booking-chat-page__intro">
            <h2 className="booking-chat-page__intro-title">Chat about your booking</h2>
            <p className="booking-chat-page__intro-desc">
              You can message here. The model will see your messages on their bookings page.
            </p>
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

        {error && (
          <p className="booking-chat__state booking-chat__state--error" style={{ margin: '0 20px 16px 20px' }}>
            {error}
          </p>
        )}

        <div className="booking-chat__messages">
          {loading ? (
            <p className="booking-chat__state">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="booking-chat__state booking-chat__state--empty">
              No messages yet. Send the first message.
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`booking-chat__message-wrap ${isClientMessage(msg) ? '' : 'booking-chat__message-wrap--other'}`}
              >
                <div
                  className={`booking-chat__bubble ${isClientMessage(msg) ? 'booking-chat__bubble--sent' : 'booking-chat__bubble--received'}`}
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
}

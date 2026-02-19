import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getGuestBookingMessages, sendGuestBookingMessage } from '../services/bookingsService';

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
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Invalid booking link.</p>
      </div>
    );
  }

  if (!emailSubmitted || !email.trim()) {
    return (
      <div className="section" style={{ maxWidth: '400px', margin: '48px auto', padding: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Reply to your booking</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Enter the email address you used when you submitted the booking request.
        </p>
        <form onSubmit={handleEmailSubmit}>
          <div className="form-group">
            <label htmlFor="guest-email">Email</label>
            <input
              id="guest-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              style={{ width: '100%', padding: '10px 12px', marginBottom: '12px' }}
            />
          </div>
          {error && <p style={{ color: '#c33', marginBottom: '12px' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 24px',
              backgroundColor: '#783FF3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="section" style={{ maxWidth: '560px', margin: '24px auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0' }}>Chat about your booking</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            You can message here. The model will see your messages on their bookings page.
          </p>
        </div>
        <button
          type="button"
          onClick={loadMessages}
          disabled={loading}
          style={{
            padding: '8px 14px',
            fontSize: '13px',
            border: '1px solid #783FF3',
            color: '#783FF3',
            backgroundColor: 'transparent',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '...' : 'Refresh'}
        </button>
      </div>
      <div style={{ marginBottom: '24px' }} />

      {error && (
        <p style={{ color: '#c33', padding: '10px 12px', backgroundColor: '#ffebee', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </p>
      )}

      <div
        style={{
          minHeight: '280px',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '12px',
          marginBottom: '16px'
        }}
      >
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
            No messages yet. Send the first message.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: '12px',
                textAlign: msg.sender_type === 'client' ? 'right' : 'left'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: msg.sender_type === 'client' ? '#783FF3' : '#e8e8e8',
                  color: msg.sender_type === 'client' ? '#fff' : '#333',
                  fontSize: '14px',
                  textAlign: 'left'
                }}
              >
                {msg.body}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#999',
                  marginTop: '4px'
                }}
              >
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            disabled={sending || !inputValue.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#783FF3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: sending ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

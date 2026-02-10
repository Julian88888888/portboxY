import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { getBookingMessages, sendBookingMessage } from '../services/bookingsService';

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
      setMessages((prev) => [...prev, result.data]);
      setInputValue('');
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

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}
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

        <div style={{ paddingBottom: '12px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Chat</h3>
            {booking && (
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                {booking.name} · {booking.email}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={loadMessages}
            disabled={loading}
            style={{ padding: '4px 10px', fontSize: '12px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '...' : 'Refresh'}
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: '200px',
            maxHeight: '360px',
            padding: '16px 0'
          }}
        >
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Loading messages...</p>
          ) : error ? (
            <p style={{ color: '#c33', padding: '8px 0' }}>{error}</p>
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
                  textAlign: msg.sender_type === 'model' ? 'right' : 'left'
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: msg.sender_type === 'model' ? '#783FF3' : '#f0f0f0',
                    color: msg.sender_type === 'model' ? '#fff' : '#333',
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
                    marginTop: '4px',
                    paddingRight: msg.sender_type === 'model' ? '4px' : 0,
                    paddingLeft: msg.sender_type === 'model' ? 0 : '4px'
                  }}
                >
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
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
    </div>
  );
};

export default BookingChatModal;

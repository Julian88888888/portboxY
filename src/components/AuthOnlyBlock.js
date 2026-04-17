import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { getAvatarUrl } from '../services/profileService';

function AuthOnlyBlock() {
  const { isAuthenticated, user } = useAuth();
  const { data: profile } = useProfile();

  const avatarSrc = useMemo(() => {
    if (profile?.show_profile_photo && profile?.profile_photo_path) {
      return getAvatarUrl(profile.profile_photo_path);
    }
    if (user?.profilePhotos && user.profilePhotos.length > 0) {
      const mainPhoto = user.profilePhotos.find((photo) => photo.isMain);
      return mainPhoto ? mainPhoto.url : user.profilePhotos[0].url;
    }
    return '/images/headshot_model.jpg';
  }, [profile?.show_profile_photo, profile?.profile_photo_path, user?.profilePhotos]);

  const displayUsername = useMemo(() => {
    const raw = profile?.username ?? user?.user_metadata?.username ?? '';
    const handle = String(raw).trim().replace(/^@+/, '');
    return handle || null;
  }, [profile?.username, user?.user_metadata?.username]);

  const publicPagePath = useMemo(() => {
    return displayUsername ? `/@${displayUsername}` : '/profile';
  }, [displayUsername]);

  if (!isAuthenticated) return null;

  return (
    <Link
      to={publicPagePath}
      className="auth-block"
      title="View your public page"
      style={{
        display: 'block',
        background: 'transparent',
        color: '#333',
        padding: '12px 12px',
        textAlign: 'left',
        borderRadius: '8px',
        margin: 0,
        boxShadow: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1100,
        maxWidth: 'min(260px, calc(100vw - 24px))',
        boxSizing: 'border-box',
        textDecoration: 'none',
        cursor: 'pointer'
      }}
    >
      <span
        style={{
          display: 'inline-block',
          color: '#111',
          fontWeight: 600,
          fontSize: '13px',
          marginBottom: '4px'
        }}
      >
        Portfolio-In-Link
      </span>
      <h2 style={{ margin: 0, fontSize: '18px', lineHeight: '1.2', fontWeight: 600, color: '#333' }}>
        Welcome Back {user?.firstName || user?.user_metadata?.firstName || 'User'}
      </h2>
      {displayUsername ? (
        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
          @{displayUsername}
        </p>
      ) : (
        <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0', fontStyle: 'italic' }}>
          Set username in Profile
        </p>
      )}
      <div style={{ marginTop: '10px' }}>
        <img
          src={avatarSrc}
          alt=""
          loading="lazy"
          className="prodile_image small_img"
          onError={(e) => {
            e.target.src = '/images/headshot_model.jpg';
          }}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #783ff3',
            display: 'block'
          }}
        />
      </div>
    </Link>
  );
}

export default AuthOnlyBlock;

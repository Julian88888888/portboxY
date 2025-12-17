import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfileSettings, ProfileSettings } from '../services/profileApi';
import supabase from '../services/supabase';

interface PublicProfileProps {
  userId: string;
}

/**
 * Public Profile Component
 * Displays a user's profile with respect to show_profile_photo and show_profile_header toggles
 * This is a minimal example showing how to respect the visibility toggles
 */
const PublicProfile: React.FC<PublicProfileProps> = ({ userId }) => {
  // In a real implementation, you'd have a public endpoint to get profile by userId
  // For now, this is just an example structure
  const { data: profile, isLoading } = useQuery<ProfileSettings>({
    queryKey: ['publicProfile', userId],
    queryFn: () => getProfileSettings(), // This would need to be modified to accept userId
    enabled: !!userId,
  });

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  // Get image URLs from Supabase storage
  const getProfilePhotoUrl = (): string | null => {
    if (!profile.show_profile_photo || !profile.profile_photo_path) {
      return null; // Don't show if toggle is off
    }
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(profile.profile_photo_path);
    return data.publicUrl;
  };

  const getHeaderPhotoUrl = (): string | null => {
    if (!profile.show_profile_header || !profile.profile_header_path) {
      return null; // Don't show if toggle is off
    }
    const { data } = supabase.storage.from('profile-headers').getPublicUrl(profile.profile_header_path);
    return data.publicUrl;
  };

  const profilePhotoUrl = getProfilePhotoUrl();
  const headerPhotoUrl = getHeaderPhotoUrl();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Header Photo - only shown if toggle is ON */}
      {headerPhotoUrl && (
        <div style={{ width: '100%', height: '200px', marginBottom: '24px' }}>
          <img
            src={headerPhotoUrl}
            alt="Profile Header"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Profile Photo - only shown if toggle is ON */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        {profilePhotoUrl ? (
          <img
            src={profilePhotoUrl}
            alt="Profile"
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/headshot_model.jpg';
            }}
          />
        ) : (
          <div
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              backgroundColor: '#e0e0e0',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}
          >
            No Photo
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div style={{ textAlign: 'center' }}>
        <h2>User Profile</h2>
        <p style={{ color: '#666' }}>
          {profilePhotoUrl ? 'Profile photo is visible' : 'Profile photo is hidden'}
        </p>
        <p style={{ color: '#666' }}>
          {headerPhotoUrl ? 'Header photo is visible' : 'Header photo is hidden'}
        </p>
      </div>
    </div>
  );
};

export default PublicProfile;


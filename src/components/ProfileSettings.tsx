import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  getProfileSettings,
  updateProfileSettings,
  getUploadUrl,
  uploadFileToUrl,
  type ProfileSettings
} from '../services/profileApi';
import supabase from '../services/supabase';

// Toast notification component (simple implementation)
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        backgroundColor: type === 'success' ? '#4caf50' : '#f44336',
        color: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 10000,
        cursor: 'pointer'
      }}
      onClick={onClose}
    >
      {message}
    </div>
  );
};

// Image Upload Component
interface ImageUploadProps {
  label: string;
  currentImagePath: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
  error?: string;
  loading: boolean;
  bucket: 'profile-photos' | 'profile-headers';
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  currentImagePath,
  onUpload,
  onRemove,
  error,
  loading,
  bucket
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Get image URL from Supabase storage
  const getImageUrl = (path: string | null): string | null => {
    if (!path) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      await onUpload(file);
    } catch (err) {
      console.error('Upload error:', err);
      setPreview(null);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const imageUrl = preview || getImageUrl(currentImagePath);

  return (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
        {label}
      </label>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <label
          htmlFor={`upload-${label}`}
          style={{
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'block',
            opacity: loading ? 0.6 : 1
          }}
        >
          <img
            src={imageUrl || 'https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg'}
            alt={label}
            style={{
              width: '150px',
              height: '150px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '2px solid #e0e0e0',
              display: 'block'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg';
            }}
          />
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id={`upload-${label}`}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          disabled={loading}
        />
        {currentImagePath && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            Remove
          </button>
        )}
        {error && (
          <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
            {error}
          </p>
        )}
        {loading && (
          <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
            Uploading...
          </p>
        )}
      </div>
    </div>
  );
};

// Toggle Switch Component
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, disabled }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          gap: '12px'
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{
            width: '50px',
            height: '28px',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        />
        <span>{label}</span>
      </label>
    </div>
  );
};

// Main ProfileSettings Component
const ProfileSettingsComponent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState<{
    profile_photo: boolean;
    profile_header: boolean;
  }>({
    profile_photo: false,
    profile_header: false
  });
  const [errors, setErrors] = useState<{
    profile_photo?: string;
    profile_header?: string;
  }>({});

  // Fetch profile settings
  const { data: profile, isLoading } = useQuery<ProfileSettings>({
    queryKey: ['profileSettings'],
    queryFn: getProfileSettings,
    enabled: isAuthenticated && !!user,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfileSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileSettings'] });
      setToast({ message: 'Profile settings saved successfully', type: 'success' });
    },
    onError: (error: Error) => {
      setToast({ message: error.message || 'Failed to save profile settings', type: 'error' });
    }
  });

  // Handle image upload
  const handleImageUpload = async (
    type: 'profile_photo' | 'profile_header',
    file: File
  ) => {
    setUploading(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: undefined }));

    try {
      // Step 1: Get signed upload URL from backend
      const { uploadUrl, path } = await getUploadUrl(type, file.name);

      // Step 2: Upload file to signed URL
      await uploadFileToUrl(uploadUrl, file);

      // Step 3: Update profile with the new path
      const updateField = type === 'profile_photo' ? 'profile_photo_path' : 'profile_header_path';
      await updateProfileSettings({
        [updateField]: path
      } as Partial<ProfileSettings>);

      setToast({ message: 'Image uploaded successfully', type: 'success' });
    } catch (error: any) {
      console.error('Upload error:', error);
      setErrors(prev => ({
        ...prev,
        [type]: error.message || 'Failed to upload image'
      }));
      setToast({ message: error.message || 'Failed to upload image', type: 'error' });
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Handle image removal
  const handleImageRemove = async (type: 'profile_photo' | 'profile_header') => {
    const updateField = type === 'profile_photo' ? 'profile_photo_path' : 'profile_header_path';
    await updateProfileSettings({
      [updateField]: null
    } as Partial<ProfileSettings>);
  };

  // Handle toggle change
  const handleToggleChange = (field: 'show_profile_photo' | 'show_profile_header', value: boolean) => {
    updateProfileMutation.mutate({
      [field]: value
    } as Partial<ProfileSettings>);
  };

  if (!isAuthenticated || !user) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Please log in to access profile settings</div>;
  }

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile settings...</div>;
  }

  const profileData = profile || {
    id: user.id || '',
    profile_photo_path: null,
    profile_header_path: null,
    show_profile_photo: true,
    show_profile_header: true,
    updated_at: new Date().toISOString()
  };

  // Get header image URL from Supabase storage
  const getHeaderImageUrl = (): string => {
    if (profileData.profile_header_path) {
      const { data } = supabase.storage.from('profile-headers').getPublicUrl(profileData.profile_header_path);
      return data.publicUrl;
    }
    return '/images/preview_48e3aa10-7b99-11e4-bb3d-ff03371996b1.jpg';
  };

  const headerImageUrl = getHeaderImageUrl();

  return (
    <section 
      className="section home_sec"
      style={{
        backgroundImage: `linear-gradient(#ffffff05 82%, #f3f5f8bd 94%, #eef2f5), url('${headerImageUrl}')`,
        backgroundPosition: '0 0, 50% 0',
        backgroundRepeat: 'repeat, no-repeat',
        backgroundSize: 'auto, cover',
        backgroundClip: 'border-box',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: '600px',
        marginBottom: '-184px',
        paddingBottom: '20px',
        display: 'flex'
      }}
    >
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '24px' }}>Profile Settings</h2>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Profile Photo Upload */}
        <ImageUpload
          label="Add Profile Photo/Logo"
          currentImagePath={profileData.profile_photo_path}
          onUpload={(file) => handleImageUpload('profile_photo', file)}
          onRemove={() => handleImageRemove('profile_photo')}
          error={errors.profile_photo}
          loading={uploading.profile_photo}
          bucket="profile-photos"
        />

        {/* Show Profile Photo Toggle */}
        <Toggle
          label="Show Profile Photo/Logo"
          checked={profileData.show_profile_photo}
          onChange={(checked) => handleToggleChange('show_profile_photo', checked)}
          disabled={updateProfileMutation.isPending}
        />

        {/* Profile Header Upload */}
        <ImageUpload
          label="Add Profile Header Photo"
          currentImagePath={profileData.profile_header_path}
          onUpload={(file) => handleImageUpload('profile_header', file)}
          onRemove={() => handleImageRemove('profile_header')}
          error={errors.profile_header}
          loading={uploading.profile_header}
          bucket="profile-headers"
        />

        {/* Show Profile Header Toggle */}
        <Toggle
          label="Show Profile Header Photo"
          checked={profileData.show_profile_header}
          onChange={(checked) => handleToggleChange('show_profile_header', checked)}
          disabled={updateProfileMutation.isPending}
        />
      </div>
    </section>
  );
};

// Export as default
const ProfileSettings = ProfileSettingsComponent;
export default ProfileSettings;


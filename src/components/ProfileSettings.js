import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile, useUpdateProfile, useCheckUsername, useUploadAvatar, useUploadHeader, useDeleteAvatar, useDeleteHeader, useProfileImageUrl, useHeaderImageUrl } from '../hooks/useProfile';
import { getAvatarUrl, getHeaderUrl } from '../services/profileService';

const JOB_TYPES = [
  { 
    id: 'Model', 
    icon: <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#FFFFFF">
      <path d="M18 21H6C6 21 7.66042 16.1746 7.5 13C7.3995 11.0112 5.97606 9.92113 6.5 8C6.72976 7.15753 7.5 6 7.5 6C7.5 6 9 7 12 7C15 7 16.5 6 16.5 6C16.5 6 17.2702 7.15753 17.5 8C18.0239 9.92113 16.6005 11.0112 16.5 13C16.3396 16.1746 18 21 18 21Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M7.49988 6.00002V3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M16.5 6.00002V3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  },
  { 
    id: 'Photographer', 
    icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M4 18V8a1 1 0 0 1 1-1h1.5l1.707-1.707A1 1 0 0 1 8.914 5h6.172a1 1 0 0 1 .707.293L17.5 7H19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"></path>
      <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
    </svg>
  },
  { 
    id: 'WardrobeStylist', 
    icon: <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000">
      <path d="M6 4H9C9 4 9 7 12 7C15 7 15 4 15 4H18M18 11V19.4C18 19.7314 17.7314 20 17.4 20H6.6C6.26863 20 6 19.7314 6 19.4L6 11" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M18 4L22.4429 5.77717C22.7506 5.90023 22.9002 6.24942 22.7772 6.55709L21.1509 10.6228C21.0597 10.8506 20.8391 11 20.5938 11H18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M5.99993 4L1.55701 5.77717C1.24934 5.90023 1.09969 6.24942 1.22276 6.55709L2.84906 10.6228C2.94018 10.8506 3.1608 11 3.40615 11H5.99993" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  },
  { 
    id: 'HairStylist', 
    icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 9H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6m0-6v6m0-6 5.419-3.87A1 1 0 0 1 18 5.942v12.114a1 1 0 0 1-1.581.814L11 15m7 0a3 3 0 0 0 0-6M6 15h3v5H6v-5Z"></path>
    </svg>
  },
  { 
    id: 'MakeupArtist', 
    icon: <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000">
      <path d="M19 12L5 21" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M5 3L5 12" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M19 3V12" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M5 12L19 21" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M4 12L20 12" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M5 4L19 4" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"></path>
      <path d="M5 7L19 7" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"></path>
    </svg>
  },
  { 
    id: 'Brand', 
    icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 0 0-2 2v4m5-6h8M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m0 0h3a2 2 0 0 1 2 2v4m0 0v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6m18 0s-4 2-9 2-9-2-9-2m9-2h.01"></path>
    </svg>
  },
  { 
    id: 'Agency', 
    icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 0 0-2 2v4m5-6h8M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m0 0h3a2 2 0 0 1 2 2v4m0 0v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6m18 0s-4 2-9 2-9-2-9-2m9-2h.01"></path>
    </svg>
  }
];

export default function ProfileSettings() {
  const { user, isAuthenticated } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const checkUsername = useCheckUsername();
  const uploadAvatar = useUploadAvatar();
  const uploadHeader = useUploadHeader();
  const deleteAvatar = useDeleteAvatar();
  const deleteHeader = useDeleteHeader();

  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    job_type: 'Model',
    description: '',
    show_profile_photo: true,
    show_header_photo: true,
    show_description: true,
  });

  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error'
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [headerPhotoPreview, setHeaderPhotoPreview] = useState(null);

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        display_name: profile.display_name || '',
        job_type: profile.job_type || 'Model',
        description: profile.description || '',
        show_profile_photo: profile.show_profile_photo ?? true,
        show_header_photo: profile.show_header_photo ?? profile.show_profile_header ?? true,
        show_description: profile.show_description ?? true,
      });
      
      // Set previews
      if (profile.profile_photo_path) {
        setProfilePhotoPreview(getAvatarUrl(profile.profile_photo_path));
      }
      // Support both header_photo_path and profile_header_path for compatibility
      const headerPath = profile.header_photo_path || profile.profile_header_path;
      if (headerPath) {
        setHeaderPhotoPreview(getHeaderUrl(headerPath));
      }
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for username: remove @ at the start and trim
    let processedValue = value;
    if (name === 'username') {
      processedValue = value.trim().replace(/^@+/, ''); // Remove leading @ and spaces
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateUsername = async (username) => {
    // Trim and remove leading @
    const cleanedUsername = username ? username.trim().replace(/^@+/, '') : '';
    
    if (!cleanedUsername) {
      return { valid: false, error: 'Username is required' };
    }

    // Check format: ^[a-zA-Z0-9._]{3,30}$, no spaces
    const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
    if (!usernameRegex.test(cleanedUsername)) {
      // More detailed error message
      if (cleanedUsername.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters long' };
      }
      if (cleanedUsername.length > 30) {
        return { valid: false, error: 'Username must be no more than 30 characters long' };
      }
      if (/\s/.test(cleanedUsername)) {
        return { valid: false, error: 'Username cannot contain spaces' };
      }
      return { 
        valid: false, 
        error: 'Username must be 3-30 characters, only letters, numbers, dots, and underscores. No spaces allowed.' 
      };
    }

    // Check uniqueness (use cleaned username)
    try {
      const result = await checkUsername.mutateAsync(cleanedUsername);
      
      // Handle result - checkUsernameAvailability now returns error in result.message if unavailable
      if (result && result.available === false) {
        return { valid: false, error: result.message || 'Username is already taken' };
      }
      
      // If available is true or undefined (error case), proceed
      if (result && result.available === true) {
        // Username is available
      } else {
        // Unexpected result format
        console.warn('Unexpected username check result:', result);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      // More specific error message
      const errorMessage = error.message || 'Unable to verify username availability. Please check your connection and try again.';
      return { valid: false, error: errorMessage };
    }

    return { valid: true, cleanedUsername };
  };

  const handleUsernameBlur = async () => {
    if (formData.username && formData.username !== profile?.username) {
      const validation = await validateUsername(formData.username);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, username: validation.error }));
      } else if (validation.cleanedUsername && validation.cleanedUsername !== formData.username) {
        // Update formData with cleaned username (remove @ and trim)
        setFormData(prev => ({ ...prev, username: validation.cleanedUsername }));
      }
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profilePhoto: 'Please select an image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profilePhoto: 'Image size must be less than 5MB' }));
      return;
    }

    try {
      setSaveStatus('saving');
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.profilePhoto;
        delete newErrors.general;
        return newErrors;
      });
      
      // Delete old avatar if exists (don't fail if delete fails)
      if (profile?.profile_photo_path) {
        try {
          await deleteAvatar.mutateAsync(profile.profile_photo_path);
        } catch (deleteError) {
          console.warn('Error deleting old avatar (continuing anyway):', deleteError);
        }
      }

      // Upload new avatar
      const path = await uploadAvatar.mutateAsync(file);
      
      // Update profile with new path
      await updateProfile.mutateAsync({ profile_photo_path: path });
      
      // Update preview
      setProfilePhotoPreview(URL.createObjectURL(file));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      const errorMessage = error.message || 'Failed to upload photo';
      
      // Check if it's an authentication error
      if (errorMessage.includes('not authenticated') || errorMessage.includes('User not authenticated')) {
        setErrors(prev => ({ 
          ...prev, 
          profilePhoto: 'Your session has expired. Please refresh the page and try again.',
          general: 'Your session has expired. Please refresh the page and try again.'
        }));
      } else {
        setErrors(prev => ({ ...prev, profilePhoto: errorMessage }));
      }
      setSaveStatus('error');
    } finally {
      e.target.value = '';
    }
  };

  const handleHeaderPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, headerPhoto: 'Please select an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, headerPhoto: 'Image size must be less than 5MB' }));
      return;
    }

    try {
      setSaveStatus('saving');
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.headerPhoto;
        delete newErrors.general;
        return newErrors;
      });
      
      // Delete old header if exists (support both column names)
      const oldHeaderPath = profile?.header_photo_path || profile?.profile_header_path;
      if (oldHeaderPath) {
        try {
          await deleteHeader.mutateAsync(oldHeaderPath);
        } catch (deleteError) {
          console.warn('Error deleting old header (continuing anyway):', deleteError);
          // Continue even if delete fails
        }
      }

      // Upload new header
      const path = await uploadHeader.mutateAsync(file);
      
      // Update profile with new path (try both column names for compatibility)
      await updateProfile.mutateAsync({ 
        header_photo_path: path,
        profile_header_path: path 
      });
      
      // Update preview
      setHeaderPhotoPreview(URL.createObjectURL(file));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error uploading header photo:', error);
      const errorMessage = error.message || 'Failed to upload photo';
      
      // Check if it's an authentication error
      if (errorMessage.includes('not authenticated') || errorMessage.includes('User not authenticated')) {
        setErrors(prev => ({ 
          ...prev, 
          headerPhoto: 'Your session has expired. Please refresh the page and try again.',
          general: 'Your session has expired. Please refresh the page and try again.'
        }));
      } else {
        setErrors(prev => ({ ...prev, headerPhoto: errorMessage }));
      }
      setSaveStatus('error');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveProfilePhoto = async () => {
    if (!profile?.profile_photo_path) return;

    try {
      setSaveStatus('saving');
      await deleteAvatar.mutateAsync(profile.profile_photo_path);
      await updateProfile.mutateAsync({ profile_photo_path: null });
      setProfilePhotoPreview(null);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error removing profile photo:', error);
      setSaveStatus('error');
    }
  };

  const handleRemoveHeaderPhoto = async () => {
    const headerPath = profile?.header_photo_path || profile?.profile_header_path;
    if (!headerPath) return;

    try {
      setSaveStatus('saving');
      await deleteHeader.mutateAsync(headerPath);
      // Remove from both columns for compatibility
      await updateProfile.mutateAsync({ 
        header_photo_path: null,
        profile_header_path: null 
      });
      setHeaderPhotoPreview(null);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error removing header photo:', error);
      setSaveStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaveStatus('saving');

    // Clean and validate username
    let usernameToSave = formData.username;
    if (formData.username && formData.username !== profile?.username) {
      const validation = await validateUsername(formData.username);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, username: validation.error }));
        setSaveStatus('error');
        return;
      }
      // Use cleaned username if it was cleaned
      if (validation.cleanedUsername) {
        usernameToSave = validation.cleanedUsername;
      }
    }

    try {
      // Save with cleaned username
      await updateProfile.mutateAsync({
        ...formData,
        username: usernameToSave
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
      // Clear any previous errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMessage = error.message || 'Failed to save profile';
      
      // Check if it's an authentication error
      if (errorMessage.includes('not authenticated') || errorMessage.includes('User not authenticated')) {
        setErrors(prev => ({ 
          ...prev, 
          general: 'Your session has expired. Please refresh the page and try again.' 
        }));
      } else {
        setErrors(prev => ({ ...prev, general: errorMessage }));
      }
      setSaveStatus('error');
    }
  };

  // Check authentication first
  if (!isAuthenticated || !user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <div>Please log in to access profile settings</div>
      </div>
    );
  }

  // Show loading only on initial load (when we don't know if profile exists yet)
  // If profile is null, it means profile doesn't exist - show form to create it
  if (profileLoading && profile === undefined) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  // Note: If profile === null, it means profile doesn't exist yet
  // We'll show the form anyway so user can create their profile

  const getProfileImageUrl = () => {
    if (profilePhotoPreview) return profilePhotoPreview;
    if (profile?.profile_photo_path) return getAvatarUrl(profile.profile_photo_path);
    return '/images/headshot_model.jpg';
  };

  const getHeaderImageUrl = () => {
    if (headerPhotoPreview) return headerPhotoPreview;
    // Support both column names for compatibility
    const headerPath = profile?.header_photo_path || profile?.profile_header_path;
    if (headerPath) return getHeaderUrl(headerPath);
    return 'https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg';
  };

  return (
    <div className="settingssection">
      <div className="spacing_24"></div>
      <h3>Profile Settings</h3>
      
      {!profile && (
        <div style={{ 
          padding: '16px', 
          marginBottom: '16px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '8px',
          border: '1px solid #90caf9'
        }}>
          <strong>Create your profile:</strong> Fill out the form below to create your profile.
        </div>
      )}
      
      {errors.general && (
        <div style={{ color: 'red', marginBottom: '16px' }}>{errors.general}</div>
      )}
      
      {saveStatus && (
        <div style={{ 
          marginBottom: '16px', 
          color: saveStatus === 'saved' ? 'green' : saveStatus === 'error' ? 'red' : 'blue' 
        }}>
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved ✓'}
          {saveStatus === 'error' && 'Error saving'}
        </div>
      )}

      <div className="w-form">
        <div className="spacing_24"></div>
        <form onSubmit={handleSubmit}>
          <div className="w-layout-hflex flex-block-10">
            <div>
              <p className="text_color_grey text_width_medium">Add Profile Photo/Logo</p>
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '8px' }}>
                <label htmlFor="profilePhotoUpload" style={{ cursor: 'pointer', display: 'block' }}>
                  <img 
                    loading="lazy" 
                    src={getProfileImageUrl()} 
                    alt="Profile Photo" 
                    style={{
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg';
                    }}
                  />
                  <input
                    type="file"
                    id="profilePhotoUpload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleProfilePhotoUpload}
                  />
                </label>
                {profile?.profile_photo_path && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePhoto}
                    style={{
                      marginTop: '4px',
                      padding: '4px 8px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                )}
                {errors.profilePhoto && (
                  <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.profilePhoto}</p>
                )}
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', textAlign: 'center' }}>
                  Click to upload
                </p>
              </div>
              <div className="w-layout-hflex flex-block-9" style={{marginTop: '12px', alignItems: 'center', gap: '12px'}}>
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer', 
                    gap: '10px',
                    userSelect: 'none',
                    flex: '0 0 auto'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    const newValue = !formData.show_profile_photo;
                    setFormData(prev => ({ ...prev, show_profile_photo: newValue }));
                    updateProfile.mutate({ show_profile_photo: newValue }, {
                      onSuccess: () => {
                        setSaveStatus('saved');
                        setTimeout(() => setSaveStatus(''), 2000);
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.show_profile_photo;
                          return newErrors;
                        });
                      },
                      onError: (error) => {
                        console.error('Error updating show_profile_photo:', error);
                        setFormData(prev => ({ ...prev, show_profile_photo: !newValue }));
                        setErrors(prev => ({ 
                          ...prev, 
                          show_profile_photo: error.message || 'Failed to update setting' 
                        }));
                      }
                    });
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: (formData.show_profile_photo ?? true) ? '#783FF3' : '#ccc',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      flexShrink: 0
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: '2px',
                        left: (formData.show_profile_photo ?? true) ? '22px' : '2px',
                        transition: 'left 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    />
                  </div>
                </label>
                <p style={{ margin: 0 }}>Show Profile Photo/Logo</p>
                {errors.show_profile_photo && (
                  <span style={{ color: 'red', fontSize: '12px', marginLeft: '8px' }}>
                    {errors.show_profile_photo}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text_color_grey text_width_medium">Add Profile Header Photo</p>
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '8px' }}>
                <label htmlFor="headerPhotoUpload" style={{ cursor: 'pointer', display: 'block' }}>
                  <img 
                    loading="lazy" 
                    src={getHeaderImageUrl()} 
                    alt="Header Photo" 
                    style={{
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg';
                    }}
                  />
                  <input
                    type="file"
                    id="headerPhotoUpload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleHeaderPhotoUpload}
                  />
                </label>
                {(profile?.header_photo_path || profile?.profile_header_path) && (
                  <button
                    type="button"
                    onClick={handleRemoveHeaderPhoto}
                    style={{
                      marginTop: '4px',
                      padding: '4px 8px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                )}
                {errors.headerPhoto && (
                  <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.headerPhoto}</p>
                )}
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', textAlign: 'center' }}>
                  Click to upload
                </p>
              </div>
              <div className="w-layout-hflex flex-block-9" style={{marginTop: '12px', alignItems: 'center', gap: '12px'}}>
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer', 
                    gap: '10px',
                    userSelect: 'none',
                    flex: '0 0 auto'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    const newValue = !formData.show_header_photo;
                    setFormData(prev => ({ ...prev, show_header_photo: newValue }));
                    updateProfile.mutate({ show_profile_header: newValue }, {
                      onSuccess: () => {
                        setSaveStatus('saved');
                        setTimeout(() => setSaveStatus(''), 2000);
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.show_header_photo;
                          return newErrors;
                        });
                      },
                      onError: (error) => {
                        console.error('Error updating show_header_photo:', error);
                        setFormData(prev => ({ ...prev, show_header_photo: !newValue }));
                        setErrors(prev => ({ 
                          ...prev, 
                          show_header_photo: error.message || 'Failed to update setting' 
                        }));
                      }
                    });
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: (formData.show_header_photo ?? true) ? '#783FF3' : '#ccc',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      flexShrink: 0
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: '2px',
                        left: (formData.show_header_photo ?? true) ? '22px' : '2px',
                        transition: 'left 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    />
                  </div>
                </label>
                <p style={{ margin: 0 }}>Show Profile Header Photo</p>
                {errors.show_header_photo && (
                  <span style={{ color: 'red', fontSize: '12px', marginLeft: '8px' }}>
                    {errors.show_header_photo}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <p className="text_color_grey text_width_medium" style={{marginTop: '24px', marginBottom: '16px'}}>Select Your Profile Job Type ⤵</p>
          <div className="w-layout-hflex header_roles">
            {JOB_TYPES.map((job) => (
              <a
                key={job.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setFormData(prev => ({ ...prev, job_type: job.id }));
                }}
                className={`flex_wrapper flex_distribute link_block small_choice w-inline-block ${formData.job_type === job.id ? 'highlight_type' : ''}`}
                style={{minWidth: '140px'}}
              >
                <div>{job.id}</div>
                <div className="icon_24x24 w-embed" style={{width: '24px', height: '24px', flexShrink: 0}}>{job.icon}</div>
              </a>
            ))}
          </div>
          
          <label htmlFor="username">Username</label>
          <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            <span style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#999',
              pointerEvents: 'none'
            }}>@</span>
            <input 
              className="w-input" 
              maxLength="30" 
              name="username" 
              placeholder="username" 
              type="text" 
              id="username" 
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleUsernameBlur}
              required
              style={{ paddingLeft: '28px' }}
            />
          </div>
          {errors.username && (
            <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.username}</p>
          )}
          
          <label htmlFor="display_name">Name</label>
          <input 
            className="w-input" 
            maxLength="256" 
            name="display_name" 
            placeholder="Full Name/Business" 
            type="text" 
            id="display_name"
            value={formData.display_name}
            onChange={handleInputChange}
            required
          />
          
          <label htmlFor="description">Profile Description</label>
          <textarea 
            id="description" 
            name="description" 
            maxLength="5000" 
            placeholder="I am a professional model with many years of experience working for top brands all over the world." 
            className="w-input"
            value={formData.description}
            onChange={handleInputChange}
          />
          
          <div className="w-layout-hflex flex-block-9">
            <img width="50" height="Auto" alt="" src="/images/smSwitch.png" loading="lazy" />
            <p>Show Profile Description</p>
          </div>
          
          <input 
            type="submit" 
            className="submit-button w-button" 
            value={saveStatus === 'saving' ? 'Saving...' : profile ? 'Save Changes' : 'Create Profile'} 
            disabled={saveStatus === 'saving'}
          />
        </form>
      </div>
    </div>
  );
}


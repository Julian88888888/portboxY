import React, { useState, useEffect } from 'react';
import { MAX_IMAGE_SIZE_HINT, validateImageFileSize } from '../utils/imageUploadLimits';
import { useAuth } from '../contexts/AuthContext';
import { useProfile, useUpdateProfile, useCheckUsername, useUploadAvatar, useUploadHeader, useDeleteAvatar, useDeleteHeader, useProfileImageUrl, useHeaderImageUrl } from '../hooks/useProfile';
import { getAvatarUrl, getHeaderUrl } from '../services/profileService';
import { PROFILE_JOB_TYPES } from '../utils/profileJobTypes';

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

    const sizeCheck = validateImageFileSize(file);
    if (!sizeCheck.valid) {
      setErrors(prev => ({ ...prev, profilePhoto: sizeCheck.error }));
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

    const sizeCheck = validateImageFileSize(file);
    if (!sizeCheck.valid) {
      setErrors(prev => ({ ...prev, headerPhoto: sizeCheck.error }));
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
    return '/images/default-avatar.svg';
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
      {/* <h3>Profile Settings</ h3> */}
      
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
                  Click to upload · {MAX_IMAGE_SIZE_HINT}
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
                  Click to upload · {MAX_IMAGE_SIZE_HINT}
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
          <div className="header_roles job-type-picker">
            {PROFILE_JOB_TYPES.map((job) => (
              <a
                key={job.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const newJobType = job.id;
                  setFormData(prev => ({ ...prev, job_type: newJobType }));
                  // Save immediately when job type is selected
                  updateProfile.mutate({ job_type: newJobType }, {
                    onSuccess: () => {
                      setSaveStatus('saved');
                      setTimeout(() => setSaveStatus(''), 2000);
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.job_type;
                        return newErrors;
                      });
                    },
                    onError: (error) => {
                      console.error('Error updating job_type:', error);
                      setFormData(prev => ({ ...prev, job_type: formData.job_type }));
                      setErrors(prev => ({ 
                        ...prev, 
                        job_type: error.message || 'Failed to update job type' 
                      }));
                    }
                  });
                }}
                className={`job-type-option flex_wrapper flex_distribute link_block small_choice ${formData.job_type === job.id ? 'highlight_type' : ''}`}
              >
                <div className="job-type-option__label">{job.label || job.id}</div>
                <div className="icon_24x24 w-embed job-type-option__icon">{job.icon}</div>
              </a>
            ))}
          </div>
          
          <label htmlFor="username">Username</label>
          <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            <span style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '35%', 
              transform: 'translateY(-50%)', 
              color: 'rgb(153, 153, 153)',
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
          {formData.username && (
            <div style={{ marginTop: '8px', marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                Your Profile URL:
              </label>
              <div style={{ 
                padding: '8px 12px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                border: '1px solid #e0e0e0',
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#333',
                display: 'inline-block',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {window.location.origin}/@{formData.username}
              </div>
            </div>
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
          
          <div className="w-layout-hflex flex-block-9" style={{ marginTop: '12px', alignItems: 'center', gap: '12px' }}>
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
                const newValue = !(formData.show_description ?? true);
                setFormData(prev => ({ ...prev, show_description: newValue }));
                updateProfile.mutate({ show_description: newValue }, {
                  onSuccess: () => {
                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus(''), 2000);
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.show_description;
                      return newErrors;
                    });
                  },
                  onError: (error) => {
                    console.error('Error updating show_description:', error);
                    setFormData(prev => ({ ...prev, show_description: !newValue }));
                    setErrors(prev => ({
                      ...prev,
                      show_description: error.message || 'Failed to update setting'
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
                  backgroundColor: (formData.show_description ?? true) ? '#783FF3' : '#ccc',
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
                    left: (formData.show_description ?? true) ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
              </div>
            </label>
            <p style={{ margin: 0 }}>Show Profile Description</p>
            {errors.show_description && (
              <span style={{ color: 'red', fontSize: '12px', marginLeft: '8px' }}>
                {errors.show_description}
              </span>
            )}
          </div>
          
          <input 
            type="submit" 
            className="submit-button w-button" 
            value={saveStatus === 'saving' ? 'Saving...' : profile ? 'Save Profile Settings' : 'Create Profile'} 
            disabled={saveStatus === 'saving'}
          />
        </form>
      </div>
    </div>
  );
}


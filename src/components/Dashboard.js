import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { getAvatarUrl, getHeaderUrl } from '../services/profileService';
import { createAlbum, getAlbums, uploadImageToAlbum, deleteAlbum, getAlbumImages, setCoverImage, normalizeImageUrl } from '../services/albumsService';
import { getCustomLinks, createCustomLink, updateCustomLink, deleteCustomLink } from '../services/customLinksService';
import { getBookings, getBookingsAsClient, deleteBooking, updateBooking } from '../services/bookingsService';
import ProfileSettings from './ProfileSettings';
import BookingChatModal from './BookingChatModal';
import './Dashboard.css';

const TAB_ROUTES = { 'Tab 1': '/profile', 'Tab 2': '/portfolio', 'Tab 3': '/bookings', 'Tab 4': '/links', 'Tab 5': '/settings' };

export default function Dashboard({ activeTab: propActiveTab, onTabChange }) {
  const navigate = useNavigate();
  const { user, updateProfile, uploadPortfolioAlbum, updatePortfolioAlbum, deletePortfolioAlbum } = useAuth();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState(propActiveTab || 'Tab 1');
  const [activeBookingTab, setActiveBookingTab] = useState('Tab 1');
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [portfolioFormData, setPortfolioFormData] = useState({
    title: '',
    description: '',
    tag: 'Fashion',
    imageFile: null,
    imagePreview: null
  });
  
  // New albums API state
  const [albums, setAlbums] = useState([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [isNewAlbumModalOpen, setIsNewAlbumModalOpen] = useState(false);
  const [newAlbumFormData, setNewAlbumFormData] = useState({
    title: '',
    description: '',
    imageFile: null,
    imagePreview: null
  });
  const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [uploadImageFile, setUploadImageFile] = useState(null);
  const [uploadImagePreview, setUploadImagePreview] = useState(null);
  const [albumImages, setAlbumImages] = useState({}); // albumId -> images array
  const [isViewImagesModalOpen, setIsViewImagesModalOpen] = useState(false);
  const [viewingAlbum, setViewingAlbum] = useState(null);
  
  // Custom Links state
  const [customLinks, setCustomLinks] = useState([]);
  const [customLinksLoading, setCustomLinksLoading] = useState(false);
  const [isCustomLinkModalOpen, setIsCustomLinkModalOpen] = useState(false);
  const [editingCustomLink, setEditingCustomLink] = useState(null);
  const [customLinkFormData, setCustomLinkFormData] = useState({
    title: '',
    url: '',
    icon_url: '',
    enabled: true
  });

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsAsClient, setBookingsAsClient] = useState([]);
  const [bookingsAsClientLoading, setBookingsAsClientLoading] = useState(false);
  const [bookingChatOpen, setBookingChatOpen] = useState(false);
  const [selectedBookingForChat, setSelectedBookingForChat] = useState(null);

  // Sync with prop changes - this ensures the tab reflects the current page
  useEffect(() => {
    if (propActiveTab && propActiveTab !== activeTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab]);

  // Load albums from new API
  useEffect(() => {
    const loadAlbums = async () => {
      setAlbumsLoading(true);
      console.log('Loading albums...');
      const result = await getAlbums();
      console.log('Albums loaded:', result);
      
      if (result.success) {
        const albumsData = result.data || [];
        console.log('Albums data:', albumsData.length, 'albums');
        setAlbums(albumsData);
        
        // Load images for each album
        if (albumsData.length > 0) {
          const imagesPromises = albumsData.map(async (album) => {
            const imagesResult = await getAlbumImages(album.id);
            return { albumId: album.id, images: imagesResult.success ? imagesResult.data : [] };
          });
          
          const imagesResults = await Promise.all(imagesPromises);
          const imagesMap = {};
          imagesResults.forEach(({ albumId, images }) => {
            imagesMap[albumId] = images;
          });
          setAlbumImages(imagesMap);
          console.log('Images loaded for', Object.keys(imagesMap).length, 'albums');
        }
      } else {
        console.error('Failed to load albums:', result.error);
        setAlbums([]);
      }
      setAlbumsLoading(false);
    };
    loadAlbums();
  }, []);

  // Load custom links
  useEffect(() => {
    const loadCustomLinks = async () => {
      // Only load if user is authenticated
      if (!user) {
        console.log('Dashboard: User not authenticated, skipping custom links load');
        setCustomLinks([]);
        setCustomLinksLoading(false);
        return;
      }

      setCustomLinksLoading(true);
      const result = await getCustomLinks();
      if (result.success) {
        setCustomLinks(result.data || []);
      } else {
        console.error('Failed to load custom links:', result.error);
        if (result.requiresAuth) {
          console.warn('Custom links require authentication - user may need to log in again');
        }
        setCustomLinks([]);
      }
      setCustomLinksLoading(false);
    };
    loadCustomLinks();
  }, [user?.id]); // Use user.id instead of user object to prevent unnecessary re-renders

  // Load bookings (as model) and as client
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setBookingsAsClient([]);
      setBookingsLoading(false);
      setBookingsAsClientLoading(false);
      return;
    }
    const loadBookings = async () => {
      setBookingsLoading(true);
      const result = await getBookings();
      if (result.success) setBookings(result.data || []);
      else setBookings([]);
      setBookingsLoading(false);
    };
    const loadBookingsAsClient = async () => {
      setBookingsAsClientLoading(true);
      const result = await getBookingsAsClient();
      if (result.success) setBookingsAsClient(result.data || []);
      else setBookingsAsClient([]);
      setBookingsAsClientLoading(false);
    };
    loadBookings();
    loadBookingsAsClient();
  }, [user?.id]);

  const handleTabChange = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    setActiveTab(tab);
    const path = TAB_ROUTES[tab];
    if (path) {
      navigate(path);
    }
  };
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
    jobType: 'Model',
    showProfilePhoto: true,
    showHeaderPhoto: true,
    showProfileDescription: true,
    instagram: '',
    twitter: '',
    linkedin: '',
    onlyfans: '',
    spotify: '',
    vimeo: '',
    cashapp: '',
    showSocialLinks: true,
    industry: '',
    status: '',
    markets: '',
    availableFor: '',
    showProfileStats: true,
    showModelStats: true,
    heightFeet: '',
    heightInches: '',
    heightUnit: '',
    weight: '',
    weightUnit: '',
    bust: '',
    bustSize: '',
    waist: '',
    waistUnit: '',
    hips: '',
    hipsUnit: '',
    shoe: '',
    shoeUnit: '',
    hairColor: '',
    hairLength: '',
    eyeColor: '',
    age: '',
    gender: '',
    ethnicity: '',
    showPortfolioWidget: true,
    showPortfolioTitle: true,
    showAlbumBadge: true,
    showAlbumTitle: true,
    showAlbumDescription: true,
    showBookMeButton: true,
    enableBookingsWidget: true,
    enableBookingsTitle: true,
    bookingsTitle: 'BOOKINGS',
    hometown: '',
    showHometown: true,
    bookingDescription: '',
    showRequestDescription: true,
    availableForBooking: '',
    showAvailableFor: true,
    showCustomLinksWidget: true,
    showCustomLinksTitle: true,
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      // Social links: Auth stores in user_metadata.socialLinks, also check profile
      const sl = user.socialLinks || user.user_metadata?.socialLinks || profile?.social_links || profile?.socialLinks || {};
      const socialLinks = {
        instagram: sl.instagram || '',
        twitter: sl.twitter || '',
        linkedin: sl.linkedin || '',
        onlyfans: sl.onlyfans || '',
        spotify: sl.spotify || '',
        vimeo: sl.vimeo || '',
        cashapp: sl.cashapp || ''
      };
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        name: user.name || '',
        bio: user.bio || '',
        industry: user.industry || '',
        status: user.status || '',
        markets: user.markets || '',
        availableFor: user.availableFor || '',
        showModelStats: user.showModelStats !== undefined ? user.showModelStats : (user.user_metadata?.showModelStats !== undefined ? user.user_metadata.showModelStats : true),
        showBookMeButton: user.showBookMeButton !== undefined ? user.showBookMeButton : (user.user_metadata?.showBookMeButton !== undefined ? user.user_metadata.showBookMeButton : true),
        showCustomLinksTitle: user.showCustomLinksTitle !== undefined ? user.showCustomLinksTitle : (user.user_metadata?.showCustomLinksTitle !== undefined ? user.user_metadata.showCustomLinksTitle : true),
        showProfileStats: user.showProfileStats !== undefined ? user.showProfileStats : (user.user_metadata?.showProfileStats !== undefined ? user.user_metadata.showProfileStats : true),
        showSocialLinks: user.showSocialLinks !== undefined ? user.showSocialLinks : (user.user_metadata?.showSocialLinks !== undefined ? user.user_metadata.showSocialLinks : true),
        showAlbumBadge: user.showAlbumBadge !== undefined ? user.showAlbumBadge : (user.user_metadata?.showAlbumBadge !== undefined ? user.user_metadata.showAlbumBadge : true),
        showAlbumTitle: user.showAlbumTitle !== undefined ? user.showAlbumTitle : (user.user_metadata?.showAlbumTitle !== undefined ? user.user_metadata.showAlbumTitle : true),
        showAlbumDescription: user.showAlbumDescription !== undefined ? user.showAlbumDescription : (user.user_metadata?.showAlbumDescription !== undefined ? user.user_metadata.showAlbumDescription : true),
        heightFeet: user.heightFeet || '',
        heightInches: user.heightInches || '',
        heightUnit: user.heightUnit || '',
        weight: user.weight || '',
        weightUnit: user.weightUnit || '',
        bust: user.bust || '',
        bustSize: user.bustSize || '',
        waist: user.waist || '',
        waistUnit: user.waistUnit || '',
        hips: user.hips || '',
        hipsUnit: user.hipsUnit || '',
        shoe: user.shoe || '',
        shoeUnit: user.shoeUnit || '',
        hairColor: user.hairColor || user.user_metadata?.hairColor || '',
        hairLength: user.hairLength || user.user_metadata?.hairLength || '',
        eyeColor: user.eyeColor || user.user_metadata?.eyeColor || '',
        age: user.age || user.user_metadata?.age || '',
        gender: user.gender || user.user_metadata?.gender || '',
        ethnicity: user.ethnicity || user.user_metadata?.ethnicity || '',
        email: user.email || '',
        instagram: socialLinks.instagram,
        twitter: socialLinks.twitter,
        linkedin: socialLinks.linkedin,
        onlyfans: socialLinks.onlyfans,
        spotify: socialLinks.spotify,
        vimeo: socialLinks.vimeo,
        cashapp: socialLinks.cashapp,
        hometown: user.currentCity || ''
      }));
    }
  }, [user, profile]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e, formType) => {
    e.preventDefault();
    try {
      const payload = formType === 'social'
        ? {
            ...formData,
            socialLinks: {
              instagram: formData.instagram || '',
              twitter: formData.twitter || '',
              linkedin: formData.linkedin || '',
              onlyfans: formData.onlyfans || '',
              spotify: formData.spotify || '',
              vimeo: formData.vimeo || '',
              cashapp: formData.cashapp || ''
            }
          }
        : formData;
      const result = await updateProfile(payload);
      if (result.success) {
        alert('Settings saved successfully!');
      } else {
        alert('Error saving settings: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    }
  };

  const getProfileImage = () => {
    // First check if profile photo is enabled and exists in profile settings
    if (profile?.show_profile_photo && profile?.profile_photo_path) {
      return getAvatarUrl(profile.profile_photo_path);
    }
    
    // Fallback to old method (profilePhotos) if profile settings not available
    if (user?.profilePhotos && user.profilePhotos.length > 0) {
      const mainPhoto = user.profilePhotos.find(photo => photo.isMain);
      return mainPhoto ? mainPhoto.url : user.profilePhotos[0].url;
    }
    return '/images/headshot_model.jpg';
  };

  // Get header photo URL for background (only if toggle is ON)
  const getHeaderBackgroundUrl = () => {
    const showHeader = profile?.show_profile_header ?? profile?.show_header_photo ?? true;
    if (!showHeader) return null;
    const headerPath = profile?.profile_header_path || profile?.header_photo_path;
    if (!headerPath) return null;
    return getHeaderUrl(headerPath);
  };

  const headerBackgroundUrl = getHeaderBackgroundUrl();

  const jobTypes = [
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
      id: 'Wardrobe Stylist', 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000">
        <path d="M6 4H9C9 4 9 7 12 7C15 7 15 4 15 4H18M18 11V19.4C18 19.7314 17.7314 20 17.4 20H6.6C6.26863 20 6 19.7314 6 19.4L6 11" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M18 4L22.4429 5.77717C22.7506 5.90023 22.9002 6.24942 22.7772 6.55709L21.1509 10.6228C21.0597 10.8506 20.8391 11 20.5938 11H18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M5.99993 4L1.55701 5.77717C1.24934 5.90023 1.09969 6.24942 1.22276 6.55709L2.84906 10.6228C2.94018 10.8506 3.1608 11 3.40615 11H5.99993" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
    },
    { 
      id: 'Hair Stylist', 
      icon: <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 9H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6m0-6v6m0-6 5.419-3.87A1 1 0 0 1 18 5.942v12.114a1 1 0 0 1-1.581.814L11 15m7 0a3 3 0 0 0 0-6M6 15h3v5H6v-5Z"></path>
      </svg>
    },
    { 
      id: 'Makeup Artist', 
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

  return (
    <div className="section full_sec">
      <div className="w-layout-hflex mainheader">
        <div className="headerbar">
          <a href="/" className="w-inline-block">
            <div className="text-block-5">Portfolio-In-Link</div>
          </a>
          <a href="/" className="w-inline-block">
            <img 
              src={getProfileImage()} 
              loading="lazy" 
              alt="" 
              className="prodile_image small_img"
              onError={(e) => {
                e.target.src = '/images/headshot_model.jpg';
              }}
            />
          </a>
        </div>
      </div>
      
      <section>
        <div className="spacing_48"></div>
        <div className="tabs w-tabs">
          <div className="tabs-content w-tab-content">
            {/* Tab 1: Profile */}
            {activeTab === 'Tab 1' && (
              <div className="w-tab-pane w--tab-active">
                <div className="w-layout-vflex flex-block-8">
                  {/* Profile Settings */}
                  <div className="settingssection">
                    <div 
                      className="profileimg_wrapper"
                      style={{
                        backgroundImage: headerBackgroundUrl ? `url(${headerBackgroundUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        borderRadius: headerBackgroundUrl ? '8px' : '0',
                        padding: headerBackgroundUrl ? '20px' : '0',
                        position: 'relative'
                      }}
                    >
                      {headerBackgroundUrl && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)',
                          borderRadius: '8px',
                          pointerEvents: 'none'
                        }} />
                      )}
                      <div className="profile_wrapper" style={{ position: 'relative', zIndex: 1 }}>
                        <img 
                          src={getProfileImage()} 
                          alt="" 
                          className="prodile_image"
                          onError={(e) => {
                            e.target.src = '/images/headshot_model.jpg';
                          }}
                        />
                      </div>
                      <div className="text_wrapper text_align_center">
                        <div className="flex_wrapper flex_center">
                          <h3>{profile?.display_name || formData.name || 'User Name'}</h3>
                          <a href="#" className="button_icon accent_button small_btn w-inline-block">
                            <div>{profile?.job_type || formData.jobType || 'Model'}</div>
                          </a>
                        </div>
                        <div className="spacing_8"></div>
                        {(profile?.username || formData.username) && (
                          <p className="username_txt">@{profile?.username || formData.username}</p>
                        )}
                        {profile?.show_description !== false && (profile?.description || formData.bio) && (
                          <p className="text_color_grey text_width_medium">
                            {profile?.description || formData.bio || 'I am a professional model with many years of experience working for top brands all over the world.'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="spacing_24"></div>
                    <h3>Profile Settings</h3>
                    {/* Profile Photo and Header Settings Component */}
                    <ProfileSettings />
                  </div>

                  {/* Social Links */}
                  <div className="settingssection">
                    <div className="spacing_24"></div>
                    <h3>Social Links</h3>
                    <div className="w-form">
                      <div className="spacing_24"></div>
                      <form onSubmit={(e) => handleSubmit(e, 'social')}>
                        <div className="w-layout-hflex flex-block-9" style={{ alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
                              const newValue = !formData.showSocialLinks;
                              setFormData(prev => ({ ...prev, showSocialLinks: newValue }));
                              updateProfile({ ...formData, showSocialLinks: newValue }).then(result => {
                                if (result.success) {
                                  console.log('Show Social Links toggle saved');
                                }
                              });
                            }}
                          >
                            <div
                              style={{
                                width: '44px',
                                height: '24px',
                                borderRadius: '12px',
                                backgroundColor: (formData.showSocialLinks ?? true) ? '#783FF3' : '#ccc',
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
                                  left: (formData.showSocialLinks ?? true) ? '22px' : '2px',
                                  transition: 'left 0.2s',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              />
                            </div>
                          </label>
                          <p style={{ margin: 0 }}>Show Social Links</p>
                        </div>
                        <label htmlFor="instagram">Instagram</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="instagram" 
                          placeholder="@username" 
                          type="text" 
                          id="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="twitter">X</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="twitter" 
                          placeholder="@username" 
                          type="text" 
                          id="twitter"
                          value={formData.twitter}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="linkedin">LinkedIn</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="linkedin" 
                          placeholder="https://linkedin.com/in/username" 
                          type="text" 
                          id="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="onlyfans">OnlyFans</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="onlyfans" 
                          placeholder="https://onlyfans.com/username" 
                          type="text" 
                          id="onlyfans"
                          value={formData.onlyfans}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="spotify">Spotify</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="spotify" 
                          placeholder="https://open.spotify.com/..." 
                          type="text" 
                          id="spotify"
                          value={formData.spotify}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="vimeo">Vimeo</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="vimeo" 
                          placeholder="https://vimeo.com/username" 
                          type="text" 
                          id="vimeo"
                          value={formData.vimeo}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="cashapp">Cash App</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="cashapp" 
                          placeholder="$username" 
                          type="text" 
                          id="cashapp"
                          value={formData.cashapp}
                          onChange={handleInputChange}
                        />
                        <div className="spacing_24"></div>
                        <input type="submit" className="submit-button w-button" value="Save" />
                      </form>
                      <div className="w-form-done" tabIndex="-1" role="region" aria-label="Email Form success">
                        <div>Thank you! Your submission has been received!</div>
                      </div>
                      <div className="w-form-fail" tabIndex="-1" role="region" aria-label="Email Form failure">
                        <div>Oops! Something went wrong while submitting the form.</div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Stats */}
                  <div className="settingssection">
                    <div className="spacing_24"></div>
                    <h3>Profile Stats</h3>
                    <div className="spacing_24"></div>
                    <div className="w-layout-hflex flex-block-9" style={{ alignItems: 'center', gap: '12px' }}>
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
                          const newValue = !formData.showProfileStats;
                          setFormData(prev => ({ ...prev, showProfileStats: newValue }));
                          updateProfile({ ...formData, showProfileStats: newValue }).then(result => {
                            if (result.success) {
                              console.log('Show Profile Stats toggle saved');
                            }
                          });
                        }}
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: (formData.showProfileStats ?? true) ? '#783FF3' : '#ccc',
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
                              left: (formData.showProfileStats ?? true) ? '22px' : '2px',
                              transition: 'left 0.2s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          />
                        </div>
                      </label>
                      <p style={{ margin: 0 }}>Show Profile Stats</p>
                    </div>
                    <div className="w-form">
                      <div style={{marginBottom: '12px'}}>
                        <div className="stats_wrap" style={{
                          display: 'grid',
                          maxWidth: '500px',
                          margin: '0 auto'
                        }}>
                          <div className="stat_item">
                            <div className="stat_label">INDUSTRY</div>
                            <div className="stat_value">{formData.industry || 'Fashion'}</div>
                          </div>
                          <div className="stat_item">
                            <div className="stat_label">STATUS</div>
                            <div className="stat_value">{formData.status || 'Professional'}</div>
                          </div>
                          <div className="stat_item">
                            <div className="stat_label">MARKETS</div>
                            <div className="stat_value">
                              {(formData.markets || 'Miami, Los Angeles, New York').split(',').map((market, idx, arr) => (
                                <div key={idx}>
                                  {market.trim()}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="stat_item">
                            <div className="stat_label">AVAILABLE FOR</div>
                            <div className="stat_value">{formData.availableFor || 'Beauty, Editorial, Glamour, Print'}</div>
                          </div>
                        </div>
                      </div>
                      <form onSubmit={(e) => handleSubmit(e, 'stats')} style={{marginTop: '12px'}}>
                        <label htmlFor="industry" style={{fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block'}}>Industry</label>
                        <select 
                          id="industry" 
                          name="industry" 
                          className="dropdowntxt w-select"
                          value={formData.industry}
                          onChange={handleInputChange}
                          style={{fontSize: '13px', padding: '8px', marginBottom: '12px'}}
                        >
                          <option value="">Select one...</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Glamour">Glamour</option>
                          <option value="Commercial">Commercial</option>
                        </select>
                        <label htmlFor="status" style={{fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block'}}>Status</label>
                        <select 
                          id="status" 
                          name="status" 
                          className="dropdowntxt w-select"
                          value={formData.status}
                          onChange={handleInputChange}
                          style={{fontSize: '13px', padding: '8px', marginBottom: '12px'}}
                        >
                          <option value="">Select one...</option>
                          <option value="Amateur">Amateur</option>
                          <option value="Semi-Professional">Semi-Professional</option>
                          <option value="Professional">Professional</option>
                        </select>
                        <label htmlFor="markets" style={{fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block'}}>Markets</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="markets" 
                          placeholder="Type Markets" 
                          type="text" 
                          id="markets"
                          value={formData.markets}
                          onChange={handleInputChange}
                          style={{fontSize: '13px', padding: '8px', marginBottom: '12px'}}
                        />
                        <label htmlFor="availableFor" style={{fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block'}}>Available For</label>
                        <select 
                          id="availableFor" 
                          name="availableFor" 
                          className="dropdowntxt w-select"
                          value={formData.availableFor}
                          onChange={handleInputChange}
                          style={{fontSize: '13px', padding: '8px', marginBottom: '12px'}}
                        >
                          <option value="">Select one...</option>
                          <option value="Beauty">Beauty</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Film">Film</option>
                        </select>
                        <input type="submit" className="submit-button w-button" value="Save" style={{fontSize: '14px', padding: '10px 20px', marginTop: '8px'}} />
                      </form>
                      <div className="w-form-done" tabIndex="-1" role="region" aria-label="Email Form success">
                        <div>Thank you! Your submission has been received!</div>
                      </div>
                      <div className="w-form-fail" tabIndex="-1" role="region" aria-label="Email Form failure">
                        <div>Oops! Something went wrong while submitting the form.</div>
                      </div>
                    </div>
                  </div>

                  {/* Model Stats */}
                  <div className="settingssection">
                    <div className="spacing_24"></div>
                    <h3>Model Stats</h3>
                    <div className="spacing_24"></div>
                    <div className="w-layout-hflex flex-block-9" style={{ alignItems: 'center', gap: '12px' }}>
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
                          const newValue = !formData.showModelStats;
                          setFormData(prev => ({ ...prev, showModelStats: newValue }));
                          updateProfile({ ...formData, showModelStats: newValue }).then(result => {
                            if (result.success) {
                              console.log('Show Model Stats toggle saved');
                            }
                          });
                        }}
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: (formData.showModelStats ?? true) ? '#783FF3' : '#ccc',
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
                              left: (formData.showModelStats ?? true) ? '22px' : '2px',
                              transition: 'left 0.2s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          />
                        </div>
                      </label>
                      <p style={{ margin: 0 }}>Show Model Stats</p>
                    </div>
                    <div className="stat_container">
                      <div className="personal_stats">
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>HEIGHT</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>
                            {formData.heightFeet && formData.heightInches
                              ? `${formData.heightFeet}'${formData.heightInches}"`
                              : "5'11\""}
                          </div>
                        </div>
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>WEIGHT</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>
                            {formData.weight
                              ? `${formData.weight} ${formData.weightUnit || 'lbs'}`
                              : '135 lbs'}
                          </div>
                        </div>
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>BUST</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>
                            {formData.bust
                              ? `${formData.bust}${formData.bustSize || ''}`
                              : '23A'}
                          </div>
                        </div>
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>WAIST</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>
                            {formData.waist
                              ? `${formData.waist} ${formData.waistUnit || 'in'}`
                              : '26 in'}
                          </div>
                        </div>
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>HIPS</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>
                            {formData.hips
                              ? `${formData.hips} ${formData.hipsUnit || 'in'}`
                              : '36 in'}
                          </div>
                        </div>
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>SHOE</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>
                            {formData.shoe
                              ? `${formData.shoe} ${formData.shoeUnit || 'US'}`
                              : '7 US'}
                          </div>
                        </div>
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>HAIR COLOR</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>{formData.hairColor || 'Black'}</div>
                        </div>
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>HAIR LENGTH</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>{formData.hairLength || 'Long'}</div>
                        </div>
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>EYE COLOR</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>{formData.eyeColor || 'Brown'}</div>
                        </div>
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>AGE</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>{formData.age || '26'}</div>
                        </div>
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>GENDER</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>{formData.gender || 'Female'}</div>
                        </div>
                        <div className="stat_item">
                          <div className="stat_label" style={{fontWeight: '700'}}>ETHNICITY</div>
                          <div className="stat_value" style={{fontWeight: '400'}}>{formData.ethnicity || 'White'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-form">
                      <div className="spacing_24"></div>
                      <form onSubmit={(e) => handleSubmit(e, 'model-stats')}>
                        <label htmlFor="heightFeet">Height</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="heightFeet" 
                          placeholder="i.e 5" 
                          type="text" 
                          value={formData.heightFeet}
                          onChange={handleInputChange}
                        />
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="heightInches" 
                          placeholder="i.e 11" 
                          type="text" 
                          value={formData.heightInches}
                          onChange={handleInputChange}
                        />
                        <select 
                          id="heightUnit" 
                          name="heightUnit" 
                          className="dropdowntxt w-select"
                          value={formData.heightUnit}
                          onChange={handleInputChange}
                        >
                          <option value="">Select one...</option>
                          <option value="FeetInches">Feet (') & Inches (")</option>
                          <option value="MetersCentimeters">Meters (m) & Centimeters (cm)</option>
                        </select>
                        <label htmlFor="weight">Weight</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="weight" 
                          placeholder="i.e 135" 
                          type="text" 
                          value={formData.weight}
                          onChange={handleInputChange}
                        />
                        <select 
                          id="weightUnit" 
                          name="weightUnit" 
                          className="dropdowntxt w-select"
                          value={formData.weightUnit}
                          onChange={handleInputChange}
                        >
                          <option value="">Select one...</option>
                          <option value="Pounds">Pounds (lbs)</option>
                          <option value="Kilograms">Kilograms (kg)</option>
                          <option value="Grams">Grams (g)</option>
                        </select>
                        <label htmlFor="bust">Bust Size</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="bust" 
                          placeholder="i.e 30" 
                          type="text" 
                          value={formData.bust}
                          onChange={handleInputChange}
                        />
                        <select 
                          id="bustSize" 
                          name="bustSize" 
                          className="dropdowntxt w-select"
                          value={formData.bustSize}
                          onChange={handleInputChange}
                        >
                          <option value="">Select one...</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                        <label htmlFor="waist">Waist Size</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="waist" 
                          placeholder="i.e 27" 
                          type="text" 
                          value={formData.waist}
                          onChange={handleInputChange}
                        />
                        <select 
                          id="waistUnit" 
                          name="waistUnit" 
                          className="dropdowntxt w-select"
                          value={formData.waistUnit}
                          onChange={handleInputChange}
                        >
                          <option value="">Select one...</option>
                          <option value="Centimeters">Centimeters (cm)</option>
                          <option value="Inches">Inches (in)</option>
                        </select>
                        <label htmlFor="hips">Hip Size</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="hips" 
                          placeholder="i.e 36" 
                          type="text" 
                          value={formData.hips}
                          onChange={handleInputChange}
                        />
                        <select 
                          id="hipsUnit" 
                          name="hipsUnit" 
                          className="dropdowntxt w-select"
                          value={formData.hipsUnit}
                          onChange={handleInputChange}
                        >
                          <option value="">Select one...</option>
                          <option value="Centimeters">Centimeters (cm)</option>
                          <option value="Inches">Inches (in)</option>
                        </select>
                        <label htmlFor="shoe">Shoe Size</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="shoe" 
                          placeholder="i.e 7" 
                          type="text" 
                          value={formData.shoe}
                          onChange={handleInputChange}
                        />
                        <select 
                          id="shoeUnit" 
                          name="shoeUnit" 
                          className="dropdowntxt w-select"
                          value={formData.shoeUnit}
                          onChange={handleInputChange}
                        >
                          <option value="">Select one...</option>
                          <option value="USUK">US/UK</option>
                          <option value="EU">EU</option>
                          <option value="JPCNKR">JP/CN/KR</option>
                        </select>
                        <label htmlFor="hairColor">Hair Color</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="hairColor" 
                          placeholder="i.e Black" 
                          type="text" 
                          value={formData.hairColor}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="hairLength">Hair Length</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="hairLength" 
                          placeholder="i.e Long" 
                          type="text" 
                          value={formData.hairLength}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="eyeColor">Eye Color</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="eyeColor" 
                          placeholder="i.e Brown" 
                          type="text" 
                          value={formData.eyeColor}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="age">Age</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="age" 
                          placeholder="D.O.B" 
                          type="text" 
                          value={formData.age}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="gender">Gender</label>
                        <select 
                          id="gender" 
                          name="gender" 
                          className="dropdowntxt w-select"
                          value={formData.gender}
                          onChange={handleInputChange}
                        >
                          <option value="">Select one...</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                        </select>
                        <label htmlFor="ethnicity">Ethnicity</label>
                        <select 
                          id="ethnicity" 
                          name="ethnicity" 
                          className="dropdowntxt w-select"
                          value={formData.ethnicity}
                          onChange={handleInputChange}
                        >
                          <option value="">Select one...</option>
                          <option value="White">White</option>
                          <option value="Black">Black</option>
                          <option value="Asian">Asian</option>
                          <option value="Hispanic">Hispanic</option>
                        </select>
                        <input type="submit" className="submit-button w-button" value="Save" />
                      </form>
                      <div className="w-form-done" tabIndex="-1" role="region" aria-label="Email Form success">
                        <div>Thank you! Your submission has been received!</div>
                      </div>
                      <div className="w-form-fail" tabIndex="-1" role="region" aria-label="Email Form failure">
                        <div>Oops! Something went wrong while submitting the form.</div>
                      </div>
                    </div>
                  </div>

                  {/* Book Me Button */}
                  <div className="settingssection">
                    <div className="spacing_24"></div>
                    <h3>Book Me Button</h3>
                    <div className="w-layout-hflex flex-block-9" style={{ alignItems: 'center', gap: '12px' }}>
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
                          const newValue = !formData.showBookMeButton;
                          setFormData(prev => ({ ...prev, showBookMeButton: newValue }));
                          updateProfile({ ...formData, showBookMeButton: newValue }).then(result => {
                            if (result.success) {
                              console.log('Show Book Me Button toggle saved');
                            }
                          });
                        }}
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: (formData.showBookMeButton ?? true) ? '#783FF3' : '#ccc',
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
                              left: (formData.showBookMeButton ?? true) ? '22px' : '2px',
                              transition: 'left 0.2s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          />
                        </div>
                      </label>
                      <p style={{ margin: 0 }}>Show Book Me Button</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Portfolio */}
            {activeTab === 'Tab 2' && (
              <div className="w-tab-pane w--tab-active">
                <div className="w-layout-vflex flex-block-8">
                  <div className="spacing_24"></div>
                  <div className="w-layout-hflex flex-block-9" style={{ alignItems: 'center', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px', userSelect: 'none', flex: '0 0 auto' }} onClick={(e) => { e.preventDefault(); const v = !formData.showAlbumBadge; setFormData(prev => ({ ...prev, showAlbumBadge: v })); updateProfile({ ...formData, showAlbumBadge: v }); }}>
                      <div style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: (formData.showAlbumBadge ?? true) ? '#783FF3' : '#ccc', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '2px', left: (formData.showAlbumBadge ?? true) ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                      <p style={{ margin: 0 }}>Show Album Badge</p>
                    </label>
                  </div>
                  <div className="w-layout-hflex flex-block-9" style={{ alignItems: 'center', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px', userSelect: 'none', flex: '0 0 auto' }} onClick={(e) => { e.preventDefault(); const v = !formData.showAlbumTitle; setFormData(prev => ({ ...prev, showAlbumTitle: v })); updateProfile({ ...formData, showAlbumTitle: v }); }}>
                      <div style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: (formData.showAlbumTitle ?? true) ? '#783FF3' : '#ccc', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '2px', left: (formData.showAlbumTitle ?? true) ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                      <p style={{ margin: 0 }}>Show Album Title</p>
                    </label>
                  </div>
                  <div className="w-layout-hflex flex-block-9" style={{ alignItems: 'center', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px', userSelect: 'none', flex: '0 0 auto' }} onClick={(e) => { e.preventDefault(); const v = !formData.showAlbumDescription; setFormData(prev => ({ ...prev, showAlbumDescription: v })); updateProfile({ ...formData, showAlbumDescription: v }); }}>
                      <div style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: (formData.showAlbumDescription ?? true) ? '#783FF3' : '#ccc', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '2px', left: (formData.showAlbumDescription ?? true) ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                      <p style={{ margin: 0 }}>Show Album Description</p>
                    </label>
                  </div>
                  
                  {/* New Albums API Section */}
                  <div className="settingssection" style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e0e0e0' }}>
                    <div className="spacing_24"></div>
                    <h3>Image Albums (New API)</h3>
                    <p className="text_color_grey" style={{ marginBottom: '16px' }}>
                      Create albums and upload multiple images to each album
                    </p>
                    
                    {albumsLoading ? (
                      <p className="text_color_grey">Loading albums...</p>
                    ) : (
                      <>
                        {albums.length === 0 ? (
                          <p className="text_color_grey" style={{ marginBottom: '24px' }}>No albums yet. Create your first album!</p>
                        ) : (
                          <div className="w-layout-grid blog_grid" style={{ marginBottom: '24px' }}>
                            {albums.map((album, index) => (
                              <div key={album.id || index} className="product_item w-inline-block" style={{ position: 'relative' }}>
                                <a href="#" className="product_item w-inline-block">
                                  <div className="product_image_wrapper">
                                    <img 
                                      src={normalizeImageUrl(album.cover_image_url) || '/images/fashion-photo.jpg'} 
                                      alt={album.title} 
                                      className="product_image fashionphoto"
                                      onError={(e) => {
                                        e.target.src = '/images/fashion-photo.jpg';
                                      }}
                                    />
                                    <div className="discount_tag">Album</div>
                                  </div>
                                  <div className="spacing_16"></div>
                                  <div className="font_weight_bold">{album.title || 'Untitled'}</div>
                                  <div className="spacing_4"></div>
                                  <p className="text_color_grey">{album.description || 'No description'}</p>
                                </a>
                                <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px', flexDirection: 'column' }}>
                                  <button
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      setViewingAlbum(album);
                                      // Load images if not already loaded
                                      if (!albumImages[album.id] || albumImages[album.id].length === 0) {
                                        const imagesResult = await getAlbumImages(album.id);
                                        if (imagesResult.success) {
                                          setAlbumImages(prev => ({
                                            ...prev,
                                            [album.id]: imagesResult.data || []
                                          }));
                                        }
                                      }
                                      setIsViewImagesModalOpen(true);
                                    }}
                                    style={{
                                      background: 'rgba(40,167,69,0.8)',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '4px 8px',
                                      color: 'white',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      marginBottom: '4px'
                                    }}
                                    title="View Images"
                                  >
                                    👁️ View
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setSelectedAlbumId(album.id);
                                      setUploadImageFile(null);
                                      setUploadImagePreview(null);
                                      setIsUploadImageModalOpen(true);
                                    }}
                                    style={{
                                      background: 'rgba(0,123,255,0.8)',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '4px 8px',
                                      color: 'white',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      marginBottom: '4px'
                                    }}
                                    title="Upload Images"
                                  >
                                    📷 Add Images
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      if (window.confirm('Are you sure you want to delete this album?')) {
                                        const result = await deleteAlbum(album.id);
                                        if (result.success) {
                                          // Reload albums
                                          const reloadResult = await getAlbums();
                                          if (reloadResult.success) {
                                            setAlbums(reloadResult.data || []);
                                            // Remove from images map
                                            const newImagesMap = { ...albumImages };
                                            delete newImagesMap[album.id];
                                            setAlbumImages(newImagesMap);
                                          }
                                        } else {
                                          alert(result.error || 'Failed to delete album');
                                        }
                                      }
                                    }}
                                    style={{
                                      background: 'rgba(220,53,69,0.8)',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '4px 8px',
                                      color: 'white',
                                      cursor: 'pointer',
                                      fontSize: '12px'
                                    }}
                                    title="Delete Album"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                                {/* Show image count */}
                                {albumImages[album.id] && albumImages[album.id].length > 0 && (
                                  <div style={{ 
                                    position: 'absolute', 
                                    bottom: '8px', 
                                    right: '8px',
                                    background: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px'
                                  }}>
                                    {albumImages[album.id].length} {albumImages[album.id].length === 1 ? 'image' : 'images'}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            setNewAlbumFormData({
                              title: '',
                              description: '',
                              imageFile: null,
                              imagePreview: null
                            });
                            setIsNewAlbumModalOpen(true);
                          }}
                          className="submit-button w-button"
                        >
                          + Create New Album
                        </button>
                      </>
                    )}
                  </div>
                  
                  <div className="settingssection">
                    <div className="spacing_24"></div>
                    <h3>Book Me Button</h3>
                    <div className="w-layout-hflex flex-block-9" style={{ alignItems: 'center', gap: '12px' }}>
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
                          const newValue = !formData.showBookMeButton;
                          setFormData(prev => ({ ...prev, showBookMeButton: newValue }));
                          updateProfile({ ...formData, showBookMeButton: newValue }).then(result => {
                            if (result.success) {
                              console.log('Show Book Me Button toggle saved');
                            }
                          });
                        }}
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: (formData.showBookMeButton ?? true) ? '#783FF3' : '#ccc',
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
                              left: (formData.showBookMeButton ?? true) ? '22px' : '2px',
                              transition: 'left 0.2s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          />
                        </div>
                      </label>
                      <p style={{ margin: 0 }}>Show Book Me Button</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Bookings */}
            {activeTab === 'Tab 3' && (
              <div className="w-tab-pane w--tab-active">
                <div className="w-tabs">
                  <div className="w-tab-menu">
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveBookingTab('Tab 1');
                      }}
                      className={`bookingtabs w-inline-block w-tab-link ${activeBookingTab === 'Tab 1' ? 'w--current' : ''}`}
                    >
                      <div>Bookings</div>
                    </a>
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveBookingTab('Tab 2');
                      }}
                      className={`bookingtabs w-inline-block w-tab-link ${activeBookingTab === 'Tab 2' ? 'w--current' : ''}`}
                    >
                      <div>Booking Settings</div>
                    </a>
                  </div>
                  <div className="w-tab-content">
                    {activeBookingTab === 'Tab 1' && (
                      <div className={`w-tab-pane ${activeBookingTab === 'Tab 1' ? 'w--tab-active' : ''}`}>
                        <div className="w-layout-vflex flex-block-11">
                          <div className="spacing_48"></div>

                          {/* Bookings I sent (as client) */}
                          {bookingsAsClient.length > 0 && (
                            <>
                              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Bookings I sent</h4>
                              <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>People you wrote to from a model page — open chat to send or read messages.</p>
                              {bookingsAsClientLoading ? (
                                <p className="paragraph">Loading...</p>
                              ) : (
                                <div style={{ marginBottom: '32px' }}>
                                  {bookingsAsClient.map((b) => (
                                    <div
                                      key={b.id}
                                      style={{
                                        padding: '16px',
                                        marginBottom: '12px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        backgroundColor: '#fafafa',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                      }}
                                    >
                                      <div>
                                        <strong>{b.model_display_name || b.model_username || 'Model'}</strong>
                                        <span style={{ color: '#666', marginLeft: '8px', fontSize: '14px' }}>
                                          {new Date(b.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                      <a
                                        href={`${window.location.origin}/booking/chat/${b.id}?email=${encodeURIComponent(user?.email || b.email)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          padding: '6px 14px',
                                          backgroundColor: '#783FF3',
                                          color: 'white',
                                          borderRadius: '4px',
                                          fontSize: '13px',
                                          textDecoration: 'none'
                                        }}
                                      >
                                        Open chat
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="spacing_24"></div>
                              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Bookings I received</h4>
                              <div className="spacing_16"></div>
                            </>
                          )}

                          {bookingsLoading ? (
                            <p className="paragraph">Loading bookings...</p>
                          ) : bookings.length === 0 ? (
                            <p className="paragraph">No bookings yet.</p>
                          ) : (
                            <div style={{ width: '100%' }}>
                              {bookings.map((booking) => (
                                <div 
                                  key={booking.id} 
                                  style={{
                                    padding: '20px',
                                    marginBottom: '16px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    backgroundColor: '#fff'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                      <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                                        {booking.name}
                                      </h4>
                                      <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
                                        {booking.email}
                                      </p>
                                    </div>
                                    <div style={{ 
                                      padding: '4px 12px', 
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      backgroundColor: 
                                        booking.status === 'accepted' ? '#d4edda' :
                                        booking.status === 'rejected' ? '#f8d7da' :
                                        booking.status === 'completed' ? '#cce5ff' :
                                        '#fff3cd',
                                      color: 
                                        booking.status === 'accepted' ? '#155724' :
                                        booking.status === 'rejected' ? '#721c24' :
                                        booking.status === 'completed' ? '#004085' :
                                        '#856404'
                                    }}>
                                      {booking.status?.toUpperCase() || 'PENDING'}
                                    </div>
                                  </div>
                                  
                                  {booking.job_type && (
                                    <div style={{ marginBottom: '8px' }}>
                                      <strong>Job Type:</strong> {booking.job_type}
                                    </div>
                                  )}
                                  
                                  {booking.dates && (
                                    <div style={{ marginBottom: '8px' }}>
                                      <strong>Dates:</strong> {booking.dates}
                                    </div>
                                  )}
                                  
                                  {booking.location && (
                                    <div style={{ marginBottom: '8px' }}>
                                      <strong>Location:</strong> {booking.location}
                                    </div>
                                  )}
                                  
                                  {booking.pay_rate && (
                                    <div style={{ marginBottom: '8px' }}>
                                      <strong>Pay Rate:</strong> {booking.pay_rate}
                                    </div>
                                  )}
                                  
                                  {booking.details && (
                                    <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                      <strong>Details:</strong>
                                      <p style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>{booking.details}</p>
                                    </div>
                                  )}
                                  
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid #e0e0e0'
                                  }}>
                                    <span style={{ fontSize: '12px', color: '#999' }}>
                                      {new Date(booking.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                      <a
                                        href={`mailto:${encodeURIComponent(booking.email)}?subject=${encodeURIComponent('Re: Your booking request')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          padding: '6px 12px',
                                          backgroundColor: '#0d6efd',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '12px',
                                          textDecoration: 'none'
                                        }}
                                      >
                                        Email
                                      </a>
                                      <button
                                        onClick={() => {
                                          setSelectedBookingForChat(booking);
                                          setBookingChatOpen(true);
                                        }}
                                        style={{
                                          padding: '6px 12px',
                                          backgroundColor: '#783FF3',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '12px'
                                        }}
                                      >
                                        Chat
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (window.confirm('Are you sure you want to delete this booking?')) {
                                            const result = await deleteBooking(booking.id);
                                            if (result.success) {
                                              setBookings(bookings.filter(b => b.id !== booking.id));
                                            } else {
                                              alert('Failed to delete booking: ' + result.error);
                                            }
                                          }
                                        }}
                                        style={{
                                          padding: '6px 12px',
                                          backgroundColor: '#dc3545',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '12px'
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {activeBookingTab === 'Tab 2' && (
                      <div className={`w-tab-pane ${activeBookingTab === 'Tab 2' ? 'w--tab-active' : ''}`}>
                        <div className="w-layout-vflex flex-block-8">
                          <div className="w-layout-hflex flex-block-9">
                            <img width="50" height="Auto" alt="" src="/images/smSwitch.png" loading="lazy" />
                            <p>Enable Bookings Widget</p>
                          </div>
                          <h3>Bookings Settings</h3>
                          <div className="settingssection">
                            <div className="w-form">
                              <form onSubmit={(e) => handleSubmit(e, 'bookings')}>
                                <div className="w-layout-hflex flex-block-9">
                                  <img width="50" height="Auto" alt="" src="/images/smSwitch.png" loading="lazy" />
                                  <p>Enable Bookings Section Title</p>
                                </div>
                                <input 
                                  className="w-input" 
                                  maxLength="256" 
                                  name="bookingsTitle" 
                                  placeholder="BOOKINGS" 
                                  type="text" 
                                  value={formData.bookingsTitle}
                                  onChange={handleInputChange}
                                />
                                <div className="spacing_24"></div>
                                <label htmlFor="hometown">Hometown</label>
                                <input 
                                  className="w-input" 
                                  maxLength="256" 
                                  name="hometown" 
                                  placeholder="I.e. Miami" 
                                  type="text" 
                                  value={formData.hometown}
                                  onChange={handleInputChange}
                                />
                                <div className="w-layout-hflex flex-block-9">
                                  <img width="50" height="Auto" alt="" src="/images/smSwitch.png" loading="lazy" />
                                  <p>Show Hometown</p>
                                </div>
                                <label htmlFor="bookingDescription">Booking Request Description</label>
                                <textarea 
                                  id="bookingDescription" 
                                  name="bookingDescription" 
                                  maxLength="5000" 
                                  placeholder="Example Text" 
                                  className="w-input"
                                  value={formData.bookingDescription}
                                  onChange={handleInputChange}
                                />
                                <div className="w-layout-hflex flex-block-9">
                                  <img width="50" height="Auto" alt="" src="/images/smSwitch.png" loading="lazy" />
                                  <p>Show Request Description</p>
                                </div>
                                <label htmlFor="availableForBooking">Available For</label>
                                <select 
                                  id="availableForBooking" 
                                  name="availableForBooking" 
                                  className="dropdowntxt w-select"
                                  value={formData.availableForBooking}
                                  onChange={handleInputChange}
                                >
                                  <option value="">Select one...</option>
                                  <option value="Photoshoot">Photoshoot</option>
                                  <option value="Acting">Acting</option>
                                  <option value="Runway">Runway</option>
                                </select>
                                <div className="w-layout-hflex flex-block-9">
                                  <img width="50" height="Auto" alt="" src="/images/smSwitch.png" loading="lazy" />
                                  <p>Show Available For</p>
                                </div>
                                <input type="submit" className="submit-button w-button" value="Save" />
                              </form>
                              <div className="w-form-done" tabIndex="-1" role="region" aria-label="Email Form success">
                                <div>Thank you! Your submission has been received!</div>
                              </div>
                              <div className="w-form-fail" tabIndex="-1" role="region" aria-label="Email Form failure">
                                <div>Oops! Something went wrong while submitting the form.</div>
                              </div>
                            </div>
                          </div>
                          <div className="spacing_24"></div>
                          <div className="modelpopup">
                            <h3>Edit Job Request Form</h3>
                            <div className="w-form">
                              <div className="spacing_24"></div>
                              <p className="text_color_grey text_width_medium">Select a job type ⤵</p>
                              <div className="spacing_24"></div>
                              <div className="w-layout-hflex flex-block-4">
                                <a href="#" className="flex_wrapper flex_distribute link_block small_choice w-inline-block">
                                  <div>Photoshoot</div>
                                  <div className="icon_24x24 w-embed">
                                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                      <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M4 18V8a1 1 0 0 1 1-1h1.5l1.707-1.707A1 1 0 0 1 8.914 5h6.172a1 1 0 0 1 .707.293L17.5 7H19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"></path>
                                      <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
                                    </svg>
                                  </div>
                                </a>
                                <a href="#" className="flex_wrapper flex_distribute link_block small_choice w-inline-block">
                                  <div>Acting</div>
                                  <div className="icon_24x24 w-embed">
                                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm7 11-6-2V9l6-2v10Z"></path>
                                    </svg>
                                  </div>
                                </a>
                                <a href="#" className="flex_wrapper flex_distribute link_block small_choice w-inline-block">
                                  <div>Runway</div>
                                  <div className="icon_24x24 w-embed">
                                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                      <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M9 5h-.16667c-.86548 0-1.70761.28071-2.4.8L3.5 8l2 3.5L8 10v9h8v-9l2.5 1.5 2-3.5-2.9333-2.2c-.6924-.51929-1.5346-.8-2.4-.8H15M9 5c0 1.5 1.5 3 3 3s3-1.5 3-3M9 5h6"></path>
                                    </svg>
                                  </div>
                                </a>
                                <a href="#" className="flex_wrapper flex_distribute link_block small_choice w-inline-block">
                                  <div>Promo</div>
                                  <div className="icon_24x24 w-embed">
                                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 9H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6m0-6v6m0-6 5.419-3.87A1 1 0 0 1 18 5.942v12.114a1 1 0 0 1-1.581.814L11 15m7 0a3 3 0 0 0 0-6M6 15h3v5H6v-5Z"></path>
                                    </svg>
                                  </div>
                                </a>
                              </div>
                              <form onSubmit={(e) => handleSubmit(e, 'job-request')}>
                                <label htmlFor="jobTitle">Job Title</label>
                                <input 
                                  className="w-input" 
                                  maxLength="256" 
                                  name="jobTitle" 
                                  placeholder="i.e Fashion Designer Photoshoot" 
                                  type="text" 
                                  id="jobTitle"
                                />
                                <label htmlFor="datesRequesting">Dates Requesting</label>
                                <input 
                                  className="w-input" 
                                  maxLength="256" 
                                  name="datesRequesting" 
                                  placeholder="Dates" 
                                  type="text" 
                                  id="datesRequesting"
                                />
                                <label htmlFor="cityCountry">City/Country</label>
                                <input 
                                  className="w-input" 
                                  maxLength="256" 
                                  name="cityCountry" 
                                  placeholder="Name of City/Country" 
                                  type="text" 
                                  id="cityCountry"
                                />
                                <label htmlFor="payRate">Pay Rate</label>
                                <input 
                                  className="w-input" 
                                  maxLength="256" 
                                  name="payRate" 
                                  placeholder="Pay rate for job" 
                                  type="text" 
                                  id="payRate"
                                />
                                <select id="payRateUnit" name="payRateUnit" className="dropdowntxt w-select">
                                  <option value="">Select one...</option>
                                  <option value="Per Hour">Per Hour</option>
                                  <option value="Per Day">Per Day</option>
                                  <option value="Per Project">Per Project</option>
                                </select>
                                <label htmlFor="jobDetails">Job Details</label>
                                <textarea 
                                  id="jobDetails" 
                                  name="jobDetails" 
                                  maxLength="5000" 
                                  placeholder="Description of project" 
                                  className="w-input"
                                />
                                <input type="submit" className="submit-button w-button" value="Submit" />
                              </form>
                              <div className="w-form-done" tabIndex="-1" role="region" aria-label="Email Form success">
                                <div>Thank you! Your submission has been received!</div>
                              </div>
                              <div className="w-form-fail" tabIndex="-1" role="region" aria-label="Email Form failure">
                                <div>Oops! Something went wrong while submitting the form.</div>
                              </div>
                            </div>
                          </div>
                          <div className="settingssection">
                            <div className="spacing_24"></div>
                            <h3>Book Me Button</h3>
                            <div className="w-layout-hflex flex-block-9" style={{ alignItems: 'center', gap: '12px' }}>
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
                                  const newValue = !formData.showBookMeButton;
                                  setFormData(prev => ({ ...prev, showBookMeButton: newValue }));
                                  updateProfile({ ...formData, showBookMeButton: newValue }).then(result => {
                                    if (result.success) {
                                      console.log('Show Book Me Button toggle saved');
                                    }
                                  });
                                }}
                              >
                                <div
                                  style={{
                                    width: '44px',
                                    height: '24px',
                                    borderRadius: '12px',
                                    backgroundColor: (formData.showBookMeButton ?? true) ? '#783FF3' : '#ccc',
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
                                      left: (formData.showBookMeButton ?? true) ? '22px' : '2px',
                                      transition: 'left 0.2s',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                  />
                                </div>
                              </label>
                              <p style={{ margin: 0 }}>Show Book Me Button</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Custom Links */}
            {activeTab === 'Tab 4' && (
              <div className="w-tab-pane w--tab-active">
                <div className="w-layout-vflex flex-block-8">
                  <div className="w-layout-hflex flex-block-9">
                    <img width="50" height="Auto" alt="" src="/images/smSwitch.png" loading="lazy" />
                    <p>Show Custom Links Widget</p>
                  </div>
                  <div className="spacing_24"></div>
                  <h3>Custom Links Settings</h3>
                  <div className="w-layout-hflex flex-block-9" style={{ alignItems: 'center', gap: '12px' }}>
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
                        const newValue = !formData.showCustomLinksTitle;
                        setFormData(prev => ({ ...prev, showCustomLinksTitle: newValue }));
                        updateProfile({ ...formData, showCustomLinksTitle: newValue }).then(result => {
                          if (result.success) {
                            console.log('Show Custom Links Title toggle saved');
                          }
                        });
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '12px',
                          backgroundColor: (formData.showCustomLinksTitle ?? true) ? '#783FF3' : '#ccc',
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
                            left: (formData.showCustomLinksTitle ?? true) ? '22px' : '2px',
                            transition: 'left 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        />
                      </div>
                    </label>
                    <p style={{ margin: 0 }}>Show Custom Links Title</p>
                  </div>
                  <div className="div-block-3">
                    <div className="w-layout-hflex flex-block-5 inputtxtdiv">
                      <div className="text_color_muted">MY LINKS</div>
                    </div>
                  </div>
                  <div className="spacing_24"></div>
                  
                  {/* Existing Links List */}
                  {customLinksLoading ? (
                    <p className="text_color_grey">Loading links...</p>
                  ) : (
                    <>
                      {customLinks.length === 0 ? (
                        <div className="settingssection" style={{ marginBottom: '24px', textAlign: 'center', padding: '40px' }}>
                          <h4 style={{ marginBottom: '16px' }}>My Links</h4>
                          <p className="text_color_grey">No links added yet.</p>
                        </div>
                      ) : (
                        <div className="settingssection" style={{ marginBottom: '24px' }}>
                          <h4>My Links</h4>
                          <div className="spacing_16"></div>
                          {customLinks.map((link) => (
                            <div 
                              key={link.id} 
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px',
                                marginBottom: '8px',
                                background: '#f5f5f5',
                                borderRadius: '8px'
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                  {link.icon_url && (
                                    <img 
                                      src={link.icon_url} 
                                      alt="" 
                                      style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }}
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  )}
                                  {link.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                                    {link.url}
                                  </a>
                                </div>
                                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                  {link.enabled ? '✓ Enabled' : '✗ Disabled'}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => {
                                    setEditingCustomLink(link);
                                    setCustomLinkFormData({
                                      title: link.title,
                                      url: link.url,
                                      icon_url: link.icon_url || '',
                                      enabled: link.enabled
                                    });
                                    setIsCustomLinkModalOpen(true);
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete this link?')) {
                                      const result = await deleteCustomLink(link.id);
                                      if (result.success) {
                                        // Reload links
                                        const reloadResult = await getCustomLinks();
                                        if (reloadResult.success) {
                                          setCustomLinks(reloadResult.data || []);
                                        }
                                      } else {
                                        alert(result.error || 'Failed to delete link');
                                      }
                                    }
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="linkpanel">
                        <div className="w-layout-hflex flex-block-9">
                          <img width="50" height="Auto" alt="" src="/images/smSwitch.png" loading="lazy" />
                          <p>Enable Link</p>
                        </div>
                        <div className="w-form">
                          <div className="spacing_24"></div>
                          <button
                            onClick={() => {
                              setEditingCustomLink(null);
                              setCustomLinkFormData({
                                title: '',
                                url: '',
                                icon_url: '',
                                enabled: true
                              });
                              setIsCustomLinkModalOpen(true);
                            }}
                            className="submit-button w-button"
                            style={{ marginBottom: '24px' }}
                          >
                            {customLinks.length === 0 ? 'Add Your First Link' : '+ Add New Link'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tab 5: Account Settings */}
            {activeTab === 'Tab 5' && (
              <div className="w-tab-pane w--tab-active">
                <div className="w-layout-vflex flex-block-8">
                  <div className="settingssection">
                    <h3>Account Settings</h3>
                    <div className="w-form">
                      <div className="spacing_24"></div>
                      <form onSubmit={(e) => handleSubmit(e, 'account')}>
                        <label htmlFor="email">Email Address</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="email" 
                          placeholder="Enter Email Address" 
                          type="email" 
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                        <label htmlFor="password">Change Password</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="password" 
                          placeholder="Enter Password" 
                          type="password" 
                          id="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input 
                          className="w-input" 
                          maxLength="256" 
                          name="confirmPassword" 
                          placeholder="Enter Password" 
                          type="password" 
                          id="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                        <input type="submit" className="submit-button w-button" value="Save" />
                      </form>
                      <div className="w-form-done" tabIndex="-1" role="region" aria-label="Email Form success">
                        <div>Thank you! Your submission has been received!</div>
                      </div>
                      <div className="w-form-fail" tabIndex="-1" role="region" aria-label="Email Form failure">
                        <div>Oops! Something went wrong while submitting the form.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <div className="section footer_sec">
        <div className="content_wrapper content_align_center">
          <div className="spacing_24"></div>
          <div className="line_divider"></div>
          <div className="spacing_24"></div>
          <div className="spacing_48"></div>
          <div className="text_wrapper text_align_center">
            <p className="text_color_grey text_width_medium"><strong>©</strong>2026 Portfolio-In-Link</p>
          </div>
          <div className="spacing_24"></div>
        </div>
      </div>

      {/* Portfolio Album Modal */}
      {isPortfolioModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsPortfolioModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{editingAlbum ? 'Edit Album' : 'Add New Album'}</h3>
              <button
                onClick={() => setIsPortfolioModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px'
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!portfolioFormData.imageFile && !portfolioFormData.imagePreview && !editingAlbum) {
                  alert('Please select an image');
                  return;
                }

                const result = editingAlbum
                  ? await updatePortfolioAlbum(editingAlbum.id, {
                      title: portfolioFormData.title,
                      description: portfolioFormData.description,
                      tag: portfolioFormData.tag,
                      imageFile: portfolioFormData.imageFile
                    })
                  : await uploadPortfolioAlbum({
                      title: portfolioFormData.title,
                      description: portfolioFormData.description,
                      tag: portfolioFormData.tag,
                      imageFile: portfolioFormData.imageFile
                    });

                if (result.success) {
                  setIsPortfolioModalOpen(false);
                  setPortfolioFormData({
                    title: '',
                    description: '',
                    tag: 'Fashion',
                    imageFile: null,
                    imagePreview: null
                  });
                  setEditingAlbum(null);
                } else {
                  alert(result.error || 'Failed to save album');
                }
              }}
            >
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="albumTitle">Title</label>
                <input
                  type="text"
                  id="albumTitle"
                  className="w-input"
                  value={portfolioFormData.title}
                  onChange={(e) => setPortfolioFormData({ ...portfolioFormData, title: e.target.value })}
                  placeholder="Album Title"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="albumTag">Tag/Category</label>
                <select
                  id="albumTag"
                  className="w-select"
                  value={portfolioFormData.tag}
                  onChange={(e) => setPortfolioFormData({ ...portfolioFormData, tag: e.target.value })}
                  required
                >
                  <option value="Fashion">Fashion</option>
                  <option value="Glamour">Glamour</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Editorial">Editorial</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Swimwear">Swimwear</option>
                  <option value="Print">Print</option>
                  <option value="Portfolio">Portfolio</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="albumDescription">Description</label>
                <textarea
                  id="albumDescription"
                  className="w-input"
                  value={portfolioFormData.description}
                  onChange={(e) => setPortfolioFormData({ ...portfolioFormData, description: e.target.value })}
                  placeholder="Album Description"
                  rows="3"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="albumImage">Image {editingAlbum && '(leave empty to keep current)'}</label>
                <input
                  type="file"
                  id="albumImage"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPortfolioFormData({
                          ...portfolioFormData,
                          imageFile: file,
                          imagePreview: reader.result
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  required={!editingAlbum}
                />
                {portfolioFormData.imagePreview && (
                  <img
                    src={portfolioFormData.imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      marginTop: '12px',
                      borderRadius: '8px'
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsPortfolioModalOpen(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button w-button"
                  style={{ flex: 1 }}
                >
                  {editingAlbum ? 'Update Album' : 'Add Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Album Modal (New API) */}
      {isNewAlbumModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsNewAlbumModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Create New Album</h3>
              <button
                onClick={() => setIsNewAlbumModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px'
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                
                if (!newAlbumFormData.title || newAlbumFormData.title.trim().length === 0) {
                  alert('Please enter an album title');
                  return;
                }

                // Step 1: Create album
                const albumResult = await createAlbum({
                  title: newAlbumFormData.title,
                  description: newAlbumFormData.description || null
                });

                if (!albumResult.success) {
                  alert(albumResult.error || 'Failed to create album');
                  return;
                }

                const albumId = albumResult.data.id;
                console.log('Album created with ID:', albumId);

                // Step 2: Upload image if provided
                if (newAlbumFormData.imageFile) {
                  const imageResult = await uploadImageToAlbum(albumId, newAlbumFormData.imageFile);
                  if (!imageResult.success) {
                    alert(`Album created but image upload failed: ${imageResult.error}`);
                  } else {
                    console.log('Image uploaded successfully');
                  }
                }

                // Reload all albums and images
                setAlbumsLoading(true);
                const reloadResult = await getAlbums();
                console.log('Reload albums result:', reloadResult);
                
                if (reloadResult.success) {
                  const albumsData = reloadResult.data || [];
                  console.log('Loaded albums:', albumsData.length);
                  setAlbums(albumsData);
                  
                  // Load images for all albums
                  const imagesPromises = albumsData.map(async (album) => {
                    const imagesResult = await getAlbumImages(album.id);
                    return { albumId: album.id, images: imagesResult.success ? imagesResult.data : [] };
                  });
                  
                  const imagesResults = await Promise.all(imagesPromises);
                  const imagesMap = {};
                  imagesResults.forEach(({ albumId, images }) => {
                    imagesMap[albumId] = images;
                  });
                  setAlbumImages(imagesMap);
                  console.log('Loaded images for albums:', Object.keys(imagesMap).length);
                } else {
                  console.error('Failed to reload albums:', reloadResult.error);
                  alert('Album created but failed to reload list. Please refresh the page.');
                }
                
                setAlbumsLoading(false);

                setIsNewAlbumModalOpen(false);
                setNewAlbumFormData({
                  title: '',
                  description: '',
                  imageFile: null,
                  imagePreview: null
                });
              }}
            >
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="newAlbumTitle">Title *</label>
                <input
                  type="text"
                  id="newAlbumTitle"
                  className="w-input"
                  value={newAlbumFormData.title}
                  onChange={(e) => setNewAlbumFormData({ ...newAlbumFormData, title: e.target.value })}
                  placeholder="Album Title"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="newAlbumDescription">Description</label>
                <textarea
                  id="newAlbumDescription"
                  className="w-input"
                  value={newAlbumFormData.description}
                  onChange={(e) => setNewAlbumFormData({ ...newAlbumFormData, description: e.target.value })}
                  placeholder="Album Description (optional)"
                  rows="3"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="newAlbumImage">Cover Image (optional - can add later)</label>
                <input
                  type="file"
                  id="newAlbumImage"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewAlbumFormData({
                          ...newAlbumFormData,
                          imageFile: file,
                          imagePreview: reader.result
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {newAlbumFormData.imagePreview && (
                  <img
                    src={newAlbumFormData.imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      marginTop: '12px',
                      borderRadius: '8px'
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewAlbumModalOpen(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button w-button"
                  style={{ flex: 1 }}
                >
                  Create Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Image to Album Modal */}
      {isUploadImageModalOpen && selectedAlbumId && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsUploadImageModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Upload Image to Album</h3>
              <button
                onClick={() => {
                  setIsUploadImageModalOpen(false);
                  setSelectedAlbumId(null);
                  setUploadImageFile(null);
                  setUploadImagePreview(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px'
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                
                if (!uploadImageFile) {
                  alert('Please select an image file');
                  return;
                }

                const imageResult = await uploadImageToAlbum(selectedAlbumId, uploadImageFile);
                
                if (!imageResult.success) {
                  alert(imageResult.error || 'Failed to upload image');
                  return;
                }

                console.log('Image uploaded successfully to album:', selectedAlbumId);

                // Reload all albums to update cover images
                setAlbumsLoading(true);
                const albumsResult = await getAlbums();
                console.log('Reload albums after image upload:', albumsResult);
                
                if (albumsResult.success) {
                  const albumsData = albumsResult.data || [];
                  setAlbums(albumsData);
                  
                  // Reload images for all albums
                  const imagesPromises = albumsData.map(async (album) => {
                    const imagesResult = await getAlbumImages(album.id);
                    return { albumId: album.id, images: imagesResult.success ? imagesResult.data : [] };
                  });
                  
                  const imagesResults = await Promise.all(imagesPromises);
                  const imagesMap = {};
                  imagesResults.forEach(({ albumId, images }) => {
                    imagesMap[albumId] = images;
                  });
                  setAlbumImages(imagesMap);
                  console.log('Updated images map:', Object.keys(imagesMap).length, 'albums');
                } else {
                  console.error('Failed to reload albums:', albumsResult.error);
                }
                
                setAlbumsLoading(false);

                setIsUploadImageModalOpen(false);
                setSelectedAlbumId(null);
                setUploadImageFile(null);
                setUploadImagePreview(null);
              }}
            >
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="uploadImageFile">Select Image *</label>
                <input
                  type="file"
                  id="uploadImageFile"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate file size (10MB)
                      if (file.size > 10 * 1024 * 1024) {
                        alert('Image size must be less than 10MB');
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setUploadImageFile(file);
                        setUploadImagePreview(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  required
                />
                {uploadImagePreview && (
                  <img
                    src={uploadImagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      marginTop: '12px',
                      borderRadius: '8px'
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadImageModalOpen(false);
                    setSelectedAlbumId(null);
                    setUploadImageFile(null);
                    setUploadImagePreview(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button w-button"
                  style={{ flex: 1 }}
                >
                  Upload Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Images Modal */}
      {isViewImagesModalOpen && viewingAlbum && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => {
            setIsViewImagesModalOpen(false);
            setViewingAlbum(null);
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{viewingAlbum.title} - Images</h2>
              <button
                onClick={() => {
                  setIsViewImagesModalOpen(false);
                  setViewingAlbum(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {albumImages[viewingAlbum.id] && albumImages[viewingAlbum.id].length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {albumImages[viewingAlbum.id].map((image) => (
                  <div
                    key={image.id}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: viewingAlbum.cover_image_id === image.id ? '3px solid #007bff' : '1px solid #ddd',
                      boxShadow: viewingAlbum.cover_image_id === image.id ? '0 0 10px rgba(0,123,255,0.5)' : 'none'
                    }}
                  >
                    <img
                      src={normalizeImageUrl(image.url) || '/images/fashion-photo.jpg'}
                      alt="Album image"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        console.error('Failed to load image:', image.url, 'Normalized:', normalizeImageUrl(image.url));
                        e.target.src = '/images/fashion-photo.jpg';
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', normalizeImageUrl(image.url));
                      }}
                    />
                    {viewingAlbum.cover_image_id === image.id && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: '#007bff',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        COVER
                      </div>
                    )}
                    <button
                      onClick={async () => {
                        const result = await setCoverImage(viewingAlbum.id, image.id);
                        if (result.success) {
                          // Reload albums to update cover
                          const albumsResult = await getAlbums();
                          if (albumsResult.success) {
                            setAlbums(albumsResult.data || []);
                            // Update viewing album
                            const updatedAlbum = albumsResult.data.find(a => a.id === viewingAlbum.id);
                            if (updatedAlbum) {
                              setViewingAlbum(updatedAlbum);
                            }
                            alert('Cover image updated!');
                          }
                        } else {
                          alert(result.error || 'Failed to set cover image');
                        }
                      }}
                      disabled={viewingAlbum.cover_image_id === image.id}
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        right: '8px',
                        background: viewingAlbum.cover_image_id === image.id ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        cursor: viewingAlbum.cover_image_id === image.id ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      title={viewingAlbum.cover_image_id === image.id ? 'This is already the cover' : 'Set as cover image'}
                    >
                      {viewingAlbum.cover_image_id === image.id ? '✓ Cover' : 'Set as Cover'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text_color_grey" style={{ textAlign: 'center', padding: '40px' }}>
                No images in this album yet. Upload images to get started!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Custom Link Modal */}
      {isCustomLinkModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsCustomLinkModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{editingCustomLink ? 'Edit Link' : 'Add New Link'}</h3>
              <button
                onClick={() => {
                  setIsCustomLinkModalOpen(false);
                  setEditingCustomLink(null);
                  setCustomLinkFormData({
                    title: '',
                    url: '',
                    icon_url: '',
                    enabled: true
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px'
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                
                if (!customLinkFormData.title || !customLinkFormData.title.trim()) {
                  alert('Please enter a title');
                  return;
                }

                if (!customLinkFormData.url || !customLinkFormData.url.trim()) {
                  alert('Please enter a URL');
                  return;
                }

                let result;
                if (editingCustomLink) {
                  result = await updateCustomLink(editingCustomLink.id, customLinkFormData);
                } else {
                  result = await createCustomLink(customLinkFormData);
                }

                if (result.success) {
                  // Reload links
                  const reloadResult = await getCustomLinks();
                  if (reloadResult.success) {
                    setCustomLinks(reloadResult.data || []);
                  }
                  
                  setIsCustomLinkModalOpen(false);
                  setEditingCustomLink(null);
                  setCustomLinkFormData({
                    title: '',
                    url: '',
                    icon_url: '',
                    enabled: true
                  });
                } else {
                  alert(result.error || 'Failed to save link');
                }
              }}
            >
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="customLinkTitle">Title *</label>
                <input
                  type="text"
                  id="customLinkTitle"
                  className="w-input"
                  value={customLinkFormData.title}
                  onChange={(e) => setCustomLinkFormData({ ...customLinkFormData, title: e.target.value })}
                  placeholder="Link Title"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="customLinkUrl">URL *</label>
                <input
                  type="url"
                  id="customLinkUrl"
                  className="w-input"
                  value={customLinkFormData.url}
                  onChange={(e) => setCustomLinkFormData({ ...customLinkFormData, url: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="customLinkIcon">Icon URL (optional)</label>
                <input
                  type="url"
                  id="customLinkIcon"
                  className="w-input"
                  value={customLinkFormData.icon_url}
                  onChange={(e) => setCustomLinkFormData({ ...customLinkFormData, icon_url: e.target.value })}
                  placeholder="https://example.com/icon.png"
                />
                {customLinkFormData.icon_url && (
                  <img
                    src={customLinkFormData.icon_url}
                    alt="Icon preview"
                    style={{
                      width: '40px',
                      height: '40px',
                      marginTop: '8px',
                      borderRadius: '4px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={customLinkFormData.enabled}
                    onChange={(e) => setCustomLinkFormData({ ...customLinkFormData, enabled: e.target.checked })}
                  />
                  Enable this link
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomLinkModalOpen(false);
                    setEditingCustomLink(null);
                    setCustomLinkFormData({
                      title: '',
                      url: '',
                      icon_url: '',
                      enabled: true
                    });
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button w-button"
                  style={{ flex: 1 }}
                >
                  {editingCustomLink ? 'Update Link' : 'Create Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Chat Modal */}
      <BookingChatModal
        isOpen={bookingChatOpen}
        onClose={() => {
          setBookingChatOpen(false);
          setSelectedBookingForChat(null);
        }}
        booking={selectedBookingForChat}
      />
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile, useProfileByUsername } from '../hooks/useProfile';
import { getAvatarUrl, getHeaderUrl } from '../services/profileService';
import { getAlbums, getAlbumImages, normalizeImageUrl } from '../services/albumsService';
import { getCustomLinks } from '../services/customLinksService';
import BookingModal from './BookingModal';

const days = [
  { key: "monday", label: "Mon", hours: "5 hours" },
  { key: "tuesday", label: "Tue", hours: "5 hours" },
  { key: "wednesday", label: "Wed", hours: "4 hours" },
  { key: "thursday", label: "Thu", hours: "6 hours" },
  { key: "friday", label: "Fri", hours: "2 hours" },
];

const travels = [
  {
    city: "Miami",
    date: "July 1 - July 10",
    img: "images/323310.png",
    imgset: "images/323310-p-500.png 500w, images/323310.png 512w",
  },
  {
    city: "Paris",
    date: "July 13 - July 28",
    img: "images/197560.png",
    imgset: "images/197560-p-500.png 500w, images/197560.png 512w",
  },
  {
    city: "Hong Kong",
    date: "Aug 1 - Aug 22",
    img: "images/197570.png",
    imgset: "images/197570-p-500.png 500w, images/197570.png 512w",
  },
];

export default function JobRequestPopup() {
  const { username: urlUsername } = useParams();
  const { user } = useAuth();
  
  // If username is in URL, get public profile; otherwise get current user's profile
  const { data: currentUserProfile } = useProfile();
  const { data: publicProfile, isLoading: publicProfileLoading } = useProfileByUsername(urlUsername);
  
  // Use public profile if username is in URL, otherwise use current user's profile
  const profile = urlUsername ? publicProfile : currentUserProfile;
  const isPublicProfile = !!urlUsername;
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumImages, setAlbumImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [customLinks, setCustomLinks] = useState([]);
  const [customLinksLoading, setCustomLinksLoading] = useState(false);

  // Helper function to get value from profile, user, or user_metadata
  const getUserValue = (field, defaultValue = '') => {
    // First check profile (from database, cached via React Query)
    if (profile?.[field] !== undefined && profile[field] !== null && profile[field] !== '') {
      return profile[field];
    }
    // Fallback to user.user_metadata (from Supabase auth)
    return user?.[field] || user?.user_metadata?.[field] || defaultValue;
  };

  // Check if model stats should be shown
  const shouldShowModelStats = () => {
    // Check profile first (from database)
    if (profile?.showModelStats !== undefined) {
      return profile.showModelStats;
    }
    if (profile?.show_model_stats !== undefined) {
      return profile.show_model_stats;
    }
    // Fallback to user metadata
    if (user?.showModelStats !== undefined) {
      return user.showModelStats;
    }
    if (user?.user_metadata?.showModelStats !== undefined) {
      return user.user_metadata.showModelStats;
    }
    // Default to true if not set
    return true;
  };

  // Check if Book Me button should be shown
  const shouldShowBookMeButton = () => {
    if (profile?.showBookMeButton !== undefined) {
      return profile.showBookMeButton;
    }
    if (profile?.show_book_me_button !== undefined) {
      return profile.show_book_me_button;
    }
    if (user?.showBookMeButton !== undefined) {
      return user.showBookMeButton;
    }
    if (user?.user_metadata?.showBookMeButton !== undefined) {
      return user.user_metadata.showBookMeButton;
    }
    return true;
  };

  // Check if Social Links (icon row) should be shown
  const shouldShowSocialLinks = () => {
    if (profile?.showSocialLinks !== undefined) {
      return profile.showSocialLinks;
    }
    if (profile?.show_social_links !== undefined) {
      return profile.show_social_links;
    }
    if (user?.showSocialLinks !== undefined) {
      return user.showSocialLinks;
    }
    if (user?.user_metadata?.showSocialLinks !== undefined) {
      return user.user_metadata.showSocialLinks;
    }
    return true;
  };

  // Normalize social link value to full URL (handles @username or full URL)
  const normalizeSocialUrl = (platform, value) => {
    if (!value || typeof value !== 'string') return '';
    const v = value.trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) return v;
    const handle = v.replace(/^@+/, '');
    const urls = {
      instagram: `https://www.instagram.com/${handle}`,
      twitter: `https://twitter.com/${handle}`,
      x: `https://x.com/${handle}`,
      linkedin: handle.startsWith('in/') ? `https://www.linkedin.com/${handle}` : `https://www.linkedin.com/in/${handle}`,
      onlyfans: `https://onlyfans.com/${handle}`,
      spotify: v.startsWith('http') ? v : `https://open.spotify.com/user/${handle}`,
      vimeo: `https://vimeo.com/${handle}`,
      cashapp: `https://cash.app/$${handle.replace(/^\$+/, '')}`
    };
    return urls[platform] || (v.startsWith('http') ? v : `https://${v}`);
  };

  // Get social links from profile or user (supports socialLinks object and flat instagram/twitter)
  const getSocialLinksList = () => {
    const links = [];
    const raw = profile?.social_links || profile?.socialLinks || user?.socialLinks || user?.user_metadata?.socialLinks || {};
    const flat = {
      instagram: raw.instagram ?? profile?.instagram ?? user?.user_metadata?.instagram ?? '',
      twitter: raw.twitter ?? raw.x ?? profile?.twitter ?? user?.user_metadata?.twitter ?? '',
      linkedin: raw.linkedin ?? '',
      onlyfans: raw.onlyfans ?? '',
      spotify: raw.spotify ?? '',
      vimeo: raw.vimeo ?? '',
      cashapp: raw.cashapp ?? ''
    };
    const platforms = ['instagram', 'twitter', 'linkedin', 'onlyfans', 'spotify', 'vimeo', 'cashapp'];
    platforms.forEach(platform => {
      const url = normalizeSocialUrl(platform, flat[platform]);
      if (url) links.push({ platform, url });
    });
    return links;
  };

  // Check if Profile Stats (INDUSTRY, STATUS, MARKETS, AVAILABLE FOR) should be shown
  const shouldShowProfileStats = () => {
    if (profile?.showProfileStats !== undefined) {
      return profile.showProfileStats;
    }
    if (profile?.show_profile_stats !== undefined) {
      return profile.show_profile_stats;
    }
    if (user?.showProfileStats !== undefined) {
      return user.showProfileStats;
    }
    if (user?.user_metadata?.showProfileStats !== undefined) {
      return user.user_metadata.showProfileStats;
    }
    return true;
  };

  const shouldShowAlbumBadge = () => {
    if (profile?.showAlbumBadge !== undefined) return profile.showAlbumBadge;
    if (profile?.show_album_badge !== undefined) return profile.show_album_badge;
    if (user?.showAlbumBadge !== undefined) return user.showAlbumBadge;
    if (user?.user_metadata?.showAlbumBadge !== undefined) return user.user_metadata.showAlbumBadge;
    return true;
  };
  const shouldShowAlbumTitle = () => {
    if (profile?.showAlbumTitle !== undefined) return profile.showAlbumTitle;
    if (profile?.show_album_title !== undefined) return profile.show_album_title;
    if (user?.showAlbumTitle !== undefined) return user.showAlbumTitle;
    if (user?.user_metadata?.showAlbumTitle !== undefined) return user.user_metadata.showAlbumTitle;
    return true;
  };
  const shouldShowAlbumDescription = () => {
    if (profile?.showAlbumDescription !== undefined) return profile.showAlbumDescription;
    if (profile?.show_album_description !== undefined) return profile.show_album_description;
    if (user?.showAlbumDescription !== undefined) return user.showAlbumDescription;
    if (user?.user_metadata?.showAlbumDescription !== undefined) return user.user_metadata.showAlbumDescription;
    return true;
  };

  // Check if Custom Links (My Links) section should be shown
  const shouldShowCustomLinksTitle = () => {
    if (profile?.showCustomLinksTitle !== undefined) {
      return profile.showCustomLinksTitle;
    }
    if (profile?.show_custom_links_title !== undefined) {
      return profile.show_custom_links_title;
    }
    if (user?.showCustomLinksTitle !== undefined) {
      return user.showCustomLinksTitle;
    }
    if (user?.user_metadata?.showCustomLinksTitle !== undefined) {
      return user.user_metadata.showCustomLinksTitle;
    }
    return true;
  };
  
  // Get profile photo from ProfileSettings (profile_photo_path)
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
    
    return '/images/headshot_model.jpg'; // Fallback to default image
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

  const handleClosePopup = (e) => {
    e.preventDefault();
    setIsPopupOpen(false);
  };

  const handleOpenPopup = (e) => {
    e.preventDefault();
    setIsPopupOpen(true);
  };

  const handleOpenBookingModal = (e) => {
    e.preventDefault();
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  // Get profile data for BookingModal (include model id for guest booking)
  const getProfileDataForModal = () => {
    if (!profile) return null;
    return {
      id: profile.id,
      displayName: getUserValue('display_name', 'User Name'),
      username: getUserValue('username'),
      jobType: getUserValue('job_type', 'Model'),
      description: getUserValue('description'),
      profileImage: getProfileImage()
    };
  };

  // Load albums on component mount
  useEffect(() => {
    const loadAlbums = async () => {
      setAlbumsLoading(true);
      console.log('ModelPage: Loading albums from', `${process.env.REACT_APP_API_URL || 'http://localhost:5002/api'}/albums`);
      try {
        const result = await getAlbums();
        console.log('ModelPage: Albums result:', result);
        if (result.success) {
          const albumsData = result.data || [];
          console.log('ModelPage: Loaded', albumsData.length, 'albums:', albumsData);
          setAlbums(albumsData);
        } else {
          console.error('ModelPage: Failed to load albums:', result.error);
          setAlbums([]);
        }
      } catch (error) {
        console.error('ModelPage: Error loading albums:', error);
        setAlbums([]);
      }
      setAlbumsLoading(false);
    };

    loadAlbums();
  }, []);

  // Load custom links on component mount
  useEffect(() => {
    const loadCustomLinks = async () => {
      // Only load if user is authenticated
      if (!user) {
        console.log('ModelPage: User not authenticated, skipping custom links load');
        setCustomLinks([]);
        setCustomLinksLoading(false);
        return;
      }

      setCustomLinksLoading(true);
      try {
        const result = await getCustomLinks();
        if (result.success) {
          // Filter only enabled links and sort by display_order
          const enabledLinks = (result.data || [])
            .filter(link => link.enabled)
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          console.log('ModelPage: Loaded', enabledLinks.length, 'custom links');
          setCustomLinks(enabledLinks);
        } else {
          console.error('ModelPage: Failed to load custom links:', result.error);
          if (result.requiresAuth) {
            console.warn('Custom links require authentication - user may need to log in again');
          }
          setCustomLinks([]);
        }
      } catch (error) {
        console.error('ModelPage: Error loading custom links:', error);
        setCustomLinks([]);
      }
      setCustomLinksLoading(false);
    };

    loadCustomLinks();
  }, [user?.id]); // Use user.id instead of user object to prevent unnecessary re-renders

  // Load images when album is selected
  const handleAlbumClick = async (album) => {
    console.log('ModelPage: Album clicked:', album);
    setSelectedAlbum(album);
    setIsAlbumModalOpen(true);
    setImagesLoading(true);
    setAlbumImages([]); // Clear previous images
    
    try {
      const result = await getAlbumImages(album.id);
      console.log('ModelPage: Album images result:', result);
      if (result.success) {
        const images = result.data || [];
        console.log('ModelPage: Loaded', images.length, 'images for album', album.title);
        setAlbumImages(images);
      } else {
        console.error('ModelPage: Failed to load album images:', result.error);
        setAlbumImages([]);
      }
    } catch (error) {
      console.error('ModelPage: Error loading album images:', error);
      setAlbumImages([]);
    }
    setImagesLoading(false);
  };

  // Handle public profile loading and not found states
  if (isPublicProfile) {
    if (publicProfileLoading) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div>Loading profile...</div>
        </div>
      );
    }
    if (!publicProfile) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Profile not found</h2>
          <p>The profile you're looking for doesn't exist or has been removed.</p>
        </div>
      );
    }
  }

  return (
    <>
    {isPopupOpen && (
    <div data-w-id="cc4101c3-66ed-1ace-7cdf-cd6dc85132d0" style={{opacity: 1, display: "flex"}} className="popup">
      <div data-w-id="69b0d63f-e58e-63a6-6dec-9a1e74daa935" style={{transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)", opacity: 1, transformStyle: "preserve-3d"}} className="modelpopup">
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
              loading="lazy" 
              style={{opacity: 1, transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)", transformStyle: "preserve-3d"}} 
              data-w-id="30764f4a-1ca9-b0b6-0704-64b5f3b87ec8" 
              alt={user?.name || "Profile"} 
              className="prodile_image" 
              onError={(e) => {
                e.target.src = '/images/headshot_model.jpg';
              }}
            />
          </div>
          <div className="text_wrapper text_align_center">
            <div className="flex_wrapper flex_center">
              <h3>{getUserValue('display_name', 'User Name')}</h3>
              <div className="icon_20x20 w-embed">
                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.50033 10.5003L9.16699 12.167L12.917 8.41699M6.1118 3.68258C6.78166 3.62912 7.41758 3.36571 7.92905 2.92984C9.12258 1.91271 10.8781 1.91271 12.0716 2.92984C12.5831 3.36571 13.219 3.62912 13.8888 3.68258C15.4521 3.80732 16.6933 5.04861 16.8181 6.6118C16.8716 7.28166 17.1349 7.91758 17.5708 8.42905C18.5879 9.62258 18.5879 11.3781 17.5708 12.5716C17.1349 13.0831 16.8716 13.719 16.8181 14.3888C16.6933 15.9521 15.4521 17.1933 13.8888 17.3181C13.219 17.3716 12.5831 17.6349 12.0716 18.0708C10.8781 19.0879 9.12258 19.0879 7.92905 18.0708C7.41758 17.6349 6.78166 17.3716 6.1118 17.3181C4.54861 17.1933 3.30732 15.9521 3.18258 14.3888C3.12912 13.719 2.86571 13.0831 2.42984 12.5716C1.41271 11.3781 1.41271 9.62258 2.42984 8.42905C2.86571 7.91758 3.12912 7.28166 3.18258 6.6118C3.30732 5.04861 4.54861 3.80732 6.1118 3.68258Z" stroke="#783FF3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <a href="#" className="button_icon accent_button small_btn w-inline-block">
                <div>{getUserValue('job_type', 'Model')}</div>
              </a>
            </div>
            <div className="spacing_8"></div>
            {getUserValue('username') && (
              <p className="username_txt">@{getUserValue('username')}</p>
            )}
            {profile?.show_description !== false && getUserValue('description') && (
              <p className="text_color_grey text_width_medium">{getUserValue('description')}</p>
            )}
          </div>
        </div>
        <div className="spacing_24"></div>
        <h3>Send Job Request</h3>
        <div className="w-form">
          <div className="spacing_24"></div>
          <p className="text_color_grey text_width_medium">Select a job type ⤵</p>
          <div className="w-layout-hflex flex-block-4">
            <a href="#" className="flex_wrapper flex_distribute link_block small_choice w-inline-block">
              <div>Photoshoots</div>
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
              <div>Promos</div>
              <div className="icon_24x24 w-embed">
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 9H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6m0-6v6m0-6 5.419-3.87A1 1 0 0 1 18 5.942v12.114a1 1 0 0 1-1.581.814L11 15m7 0a3 3 0 0 0 0-6M6 15h3v5H6v-5Z"></path>
                </svg>
              </div>
            </a>
          </div>
          <form id="email-form" name="email-form" data-name="Email Form" method="get" data-wf-page-id="6833a4252de35f796c6f7e32" data-wf-element-id="09121093-e8ff-838d-b745-37591be1ad1b" aria-label="Email Form">
            <label htmlFor="name">Name</label>
            <input className="w-input" maxLength="256" name="name" data-name="Name" placeholder="Full Name" type="text" id="name" />
            <label htmlFor="email">Email Address</label>
            <input className="w-input" maxLength="256" name="email" data-name="Email" placeholder="@" type="email" id="email" required="" />
            <label htmlFor="field-3">Dates Requesting</label>
            <input className="w-input" maxLength="256" name="field-3" data-name="Field 3" placeholder="Dates" type="text" id="field-3" required="" />
            <label htmlFor="field-3">City/Country</label>
            <input className="w-input" maxLength="256" name="field-3" data-name="Field 3" placeholder="Name of City/Country" type="text" id="field-3" required="" />
            <label htmlFor="field-3">Pay Rate</label>
            <input className="w-input" maxLength="256" name="field-3" data-name="Field 3" placeholder="Pay rate for job" type="text" id="field-3" required="" />
            <label htmlFor="field">Job Details</label>
            <textarea placeholder="Description of project" maxLength="5000" id="field" name="field" data-name="Field" className="w-input"></textarea>
            <input type="submit" data-wait="Please wait..." className="submit-button w-button" value="Submit" />
          </form>
          <div className="w-form-done" tabIndex="-1" role="region" aria-label="Email Form success">
            <div>Thank you! Your submission has been received!</div>
          </div>
          <div className="w-form-fail" tabIndex="-1" role="region" aria-label="Email Form failure">
            <div>Oops! Something went wrong while submitting the form.</div>
          </div>
        </div>
        <a data-w-id="b2334c78-825c-4de4-7502-e1d5bb1d29f9" href="#" className="link-block w-inline-block" onClick={handleClosePopup}>
          <div className="w-embed">
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clipRule="evenodd"></path>
            </svg>
          </div>
        </a>
      </div>
    </div>
    )}
      <section 
        className="section home_sec"
        style={{
          backgroundImage: `linear-gradient(#ffffff05 82%, #f3f5f8bd 94%, #eef2f5), url('${headerBackgroundUrl || '/images/preview_48e3aa10-7b99-11e4-bb3d-ff03371996b1.jpg'}')`,
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
      ></section>
      <div className="section profile_sec">
        <div className="content_wrapper content_align_center">
          <div className="spacing_48" />
          <div className="profile_wrapper">
            <img
              src={getProfileImage()}
              loading="lazy"
              data-w-id="a631810c-b7df-495c-c9a7-03835c973869"
              alt={user?.name || "Profile"}
              className="prodile_image"
              onError={(e) => {
                e.target.src = '/images/headshot_model.jpg';
              }}
            />
          </div>
          <div className="spacing_24" />
          <div className="text_wrapper text_align_center">
            <div className="flex_wrapper flex_center">
              <h3>{getUserValue('display_name', 'User Name')}</h3>
              <div className="icon_20x20 w-embed">
                {/* SVG Icon */}
                <svg width="20" height="21" viewBox="0 0 20 21" fill="none">
                  <path
                    d="M7.50033 10.5003L9.16699 12.167L12.917 8.41699M6.1118 3.68258C6.78166 3.62912 7.41758 3.36571 7.92905 2.92984C9.12258 1.91271 10.8781 1.91271 12.0716 2.92984C12.5831 3.36571 13.219 3.62912 13.8888 3.68258C15.4521 3.80732 16.6933 5.04861 16.8181 6.6118C16.8716 7.28166 17.1349 7.91758 17.5708 8.42905C18.5879 9.62258 18.5879 11.3781 17.5708 12.5716C17.1349 13.0831 16.8716 13.719 16.8181 14.3888C16.6933 15.9521 15.4521 17.1933 13.8888 17.3181C13.219 17.3716 12.5831 17.6349 12.0716 18.0708C10.8781 19.0879 9.12258 19.0879 7.92905 18.0708C7.41758 17.6349 6.78166 17.3716 6.1118 17.3181C4.54861 17.1933 3.30732 15.9521 3.18258 14.3888C3.12912 13.719 2.86571 13.0831 2.42984 12.5716C1.41271 11.3781 1.41271 9.62258 2.42984 8.42905C2.86571 7.91758 3.12912 7.28166 3.18258 6.6118C3.30732 5.04861 4.54861 3.80732 6.1118 3.68258Z"
                    stroke="#783FF3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <a href="#" className="button_icon accent_button small_btn w-inline-block">
                <div>{getUserValue('job_type', 'Model')}</div>
              </a>
            </div>
            <div className="spacing_8" />
            {getUserValue('username') && (
              <p className="username_txt">@{getUserValue('username')}</p>
            )}
            {profile?.show_description !== false && getUserValue('description') && (
              <p className="text_color_grey text_width_medium">
                {getUserValue('description')}
              </p>
            )}
          </div>
          <div className="spacing_24" />
          {shouldShowSocialLinks() && getSocialLinksList().length > 0 && (
          <div className="flex_wrapper flex_center">
            {getSocialLinksList().map(({ platform, url }) => (
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="icon_wrapper w-inline-block" aria-label={platform}>
                <div className="icon_24x24 w-embed">
                  {platform === 'twitter' && <svg className="w-[24px] h-[24px]" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M13.795 10.533 20.68 2h-3.073l-5.255 6.517L7.69 2H1l7.806 10.91L1.47 22h3.074l5.705-7.07L15.31 22H22l-8.205-11.467Zm-2.38 2.95L9.97 11.464 4.36 3.627h2.31l4.528 6.317 1.443 2.02 6.018 8.409h-2.31l-4.934-6.89Z"/></svg>}
                  {platform === 'instagram' && <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" clipRule="evenodd"/></svg>}
                  {platform === 'linkedin' && <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>}
                  {platform === 'onlyfans' && <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 12c-2.21 0-4-1.79-4-4 0-1.66 1.34-3 3-3s3 1.34 3 3c0 2.21-1.79 4-4 4z"/></svg>}
                  {platform === 'spotify' && <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.405.12-.81-.18-.93-.579-.12-.405.18-.81.579-.93 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.24 1.021zm.66-3.24c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>}
                  {platform === 'vimeo' && <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.52c-.156 0-.701.328-1.634.979l-.978-1.261s1.697-1.489 3.646-3.181c2.223-1.932 3.893-2.764 4.993-2.497 2.634.523 3.116 3.598 1.437 9.23-.574 1.935-1.019 3.282-1.339 4.04-.607 1.446-1.262 2.171-1.965 2.171-.578 0-1.294-.618-2.152-1.855-.858-1.236-1.475-2.176-1.854-2.816-.774-1.255-1.597-1.882-2.469-1.882-.189 0-.378.021-.567.063 1.18-3.872 3.434-5.756 6.762-5.656 2.578.063 3.846 1.682 3.806 4.858z"/></svg>}
                  {platform === 'cashapp' && <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.59 12.41a1 1 0 0 0-1.41-1.41L13 19.17V5a1 1 0 0 0-2 0v14.17l-9.18-9.18a1 1 0 1 0-1.41 1.41l10.59 10.59a1 1 0 0 0 1.41 0l10.59-10.59z"/></svg>}
                </div>
              </a>
            ))}
          </div>
          )}
          {/* Social links now rendered dynamically via getSocialLinksList() above */}
          {shouldShowProfileStats() && (
          <div className="stats_wrap">
            <div className="stat_item">
              <div className="stat_title">INDUSTRY</div>
              <div className="stat_descript">{getUserValue('industry', 'Fashion')}</div>
            </div>
            <div className="stat_item">
              <div className="stat_title">STATUS</div>
              <div className="stat_descript">{getUserValue('status', 'Professional')}</div>
            </div>
            <div className="stat_item">
              <div className="stat_title">MARKETS</div>
              <div className="stat_descript">
                {getUserValue('markets', 'Miami, Los Angeles, New York').split(',').map((market, idx, arr) => (
                  <div key={idx}>
                    {market.trim()}
                  </div>
                ))}
              </div>
            </div>
            <div className="stat_item">
              <div className="stat_title">AVAILABLE FOR</div>
              <div className="stat_descript">
                {getUserValue('availableFor', 'Beauty, Editorial, Glamour, Print')}
              </div>
            </div>
          </div>
          )}
          <div className="spacing_24" />
          {shouldShowModelStats() && (
            <div className="stat_container">
              <div className="stats_wrap_bottom">
                <div className="stat_item">
                  <div className="stat_title">HEIGHT</div>
                  <div className="stat_descript">
                    {getUserValue('heightFeet') && getUserValue('heightInches')
                      ? `${getUserValue('heightFeet')}'${getUserValue('heightInches')}"`
                      : "5'11\""}
                  </div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">WEIGHT</div>
                  <div className="stat_descript">
                    {getUserValue('weight') 
                      ? `${getUserValue('weight')} ${getUserValue('weightUnit', 'lbs')}`
                      : '135 lbs'}
                  </div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">BUST</div>
                  <div className="stat_descript">
                    {getUserValue('bust') 
                      ? `${getUserValue('bust')}${getUserValue('bustSize', '')}`
                      : '23A'}
                  </div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">WAIST</div>
                  <div className="stat_descript">
                    {getUserValue('waist') 
                      ? `${getUserValue('waist')} ${getUserValue('waistUnit', 'in')}`
                      : '26 in'}
                  </div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">HIPS</div>
                  <div className="stat_descript">
                    {getUserValue('hips') 
                      ? `${getUserValue('hips')} ${getUserValue('hipsUnit', 'in')}`
                      : '36 in'}
                  </div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">SHOE</div>
                  <div className="stat_descript">
                    {getUserValue('shoe') 
                      ? `${getUserValue('shoe')} ${getUserValue('shoeUnit', 'US')}`
                      : '7 US'}
                  </div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">HAIR COLOR</div>
                  <div className="stat_descript">{getUserValue('hairColor', 'Black')}</div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">HAIR LENGTH</div>
                  <div className="stat_descript">{getUserValue('hairLength', 'Long')}</div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">EYE COLOR</div>
                  <div className="stat_descript">{getUserValue('eyeColor', 'Brown')}</div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">AGE</div>
                  <div className="stat_descript">{getUserValue('age', '26')}</div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">GENDER</div>
                  <div className="stat_descript">{getUserValue('gender', 'Female')}</div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">ETHNICITY</div>
                  <div className="stat_descript">{getUserValue('ethnicity', 'White')}</div>
                </div>
              </div>
            </div>
          )}
          {shouldShowModelStats() && <div className="spacing_24" />}
          <div className="spacing_24" />
      {shouldShowBookMeButton() && (
        <>
      <a data-w-id="ee47a855-7715-a4cf-bb17-0acb8cc29f1d" href="#" className="button bookme_large w-button" onClick={handleOpenBookingModal}>
        Book Me
      </a>
      <div className="spacing_24" />
        </>
      )}
      <div className="line_divider" />
      <div className="spacing_48" />
        </div>
      </div>
      {/* Portfolio Albums Section */}
      <div className="section portfolio_sec">
        <div className="content_wrapper">
          <div className="spacing_48"></div>
          <h4 className="section_title">Portfolio</h4>
          <div className="spacing_24"></div>
          
          {albumsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p className="text_color_grey">Loading portfolio...</p>
            </div>
          ) : albums.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p className="text_color_grey">No albums yet.</p>
            </div>
          ) : (
            <div className="w-layout-grid blog_grid" style={{ marginBottom: '24px' }}>
              {albums.map((album, index) => (
                <div 
                  key={album.id || index} 
                  className="product_item w-inline-block" 
                  style={{ 
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleAlbumClick(album)}
                >
                  <a 
                    href="#" 
                    className="product_item w-inline-block"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAlbumClick(album);
                    }}
                  >
                    <div className="product_image_wrapper">
                      <img 
                        src={normalizeImageUrl(album.cover_image_url) || '/images/fashion-photo.jpg'} 
                        alt={album.title} 
                        className="product_image fashionphoto"
                        onError={(e) => {
                          e.target.src = '/images/fashion-photo.jpg';
                        }}
                      />
                      {shouldShowAlbumBadge() && <div className="discount_tag-top">{album.title || 'Album'}</div>}
                    </div>
                    <div className="spacing_16"></div>
                    {shouldShowAlbumTitle() && <div className="font_weight_bold">{album.title || 'Untitled'}</div>}
                    {shouldShowAlbumTitle() && <div className="spacing_4"></div>}
                    {shouldShowAlbumDescription() && <p className="text_color_grey">{album.description || 'No description'}</p>}
                  </a>
                </div>
              ))}
            </div>
          )}
          <div className="spacing_48"></div>
          <div className="line_divider"></div>
          {shouldShowBookMeButton() && (
          <a data-w-id="ee47a855-7715-a4cf-bb17-0acb8cc29f1d" href="#" className="button bookme_large w-button" onClick={handleOpenBookingModal}>
        Book Me
      </a>
          )}
        </div>
      </div>

      {shouldShowCustomLinksTitle() && (
      <div className="section links_sec">
        <div className="content_wrapper largebanner_btn">
          <div className="spacing_48"></div>
          <h4 className="section_title links_headinng">My Links</h4>
          <div className="spacing_24"></div>
          {customLinksLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <p>Loading links...</p>
            </div>
          ) : (
            <div className="w-layout-grid link_cloud_grid">
              {customLinks.length > 0 ? (
                customLinks.map((link, index) => (
                  <a
                    key={link.id || index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex_wrapper flex_distribute link_block w-inline-block"
                  >
                    {link.icon_url && (
                      <img 
                        src={link.icon_url} 
                        loading="lazy" 
                        alt="" 
                        className="icon_32x32"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>{link.title}</div>
                    <div className="icon_24x24 w-embed">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M10 5H7.8C6.11984 5 5.27976 5 4.63803 5.32698C4.07354 5.6146 3.6146 6.07354 3.32698 6.63803C3 7.27976 3 8.11984 3 9.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H14.2C15.8802 21 16.7202 21 17.362 20.673C17.9265 20.3854 18.3854 19.9265 18.673 19.362C19 18.7202 19 17.8802 19 16.2V14M21 9V3V9ZM21 3H15H21ZM21 3L13 11L21 3Z" stroke="#783FF3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </a>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  <p>No links added yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      <div className="section footer_sec">
        <div className="content_wrapper content_align_center">
          <div className="spacing_24"></div>
          <div className="line_divider"></div>
          <div className="spacing_24"></div>
          <a href="#">Create A Free Model Link Portfolio</a>
          <div className="spacing_48"></div>

          <div className="w-layout-hflex flex-block-5 profilepage">
            <div className="text_color_muted">portfolio.link/@</div>
            <a href="#" className="flex_wrapper flex_distribute link_block small_choice home_choice signupbtn w-inline-block">
              <div>Sign Up Free</div>
              <div className="icon_24x24 w-embed"><svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"></path>
                </svg></div>
            </a>
          </div>

          <div className="text_wrapper text_align_center">
            <p className="text_color_grey text_width_medium"><strong>©</strong>2025 Model Link Portfolio</p>
          </div>
          <div className="spacing_48"></div>
          <div className="spacing_24"></div>
        </div>
      </div>

      {/* Album Images Modal */}
      {isAlbumModalOpen && selectedAlbum && (
        <div
          className="modal-overlay" 
          onClick={() => {
            setIsAlbumModalOpen(false);
            setSelectedAlbum(null);
            setAlbumImages([]);
          }}
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
        >
          <div
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
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
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{selectedAlbum.title} - Images</h2>
              <button
                onClick={() => {
                  setIsAlbumModalOpen(false);
                  setSelectedAlbum(null);
                  setAlbumImages([]);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {imagesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p className="text_color_grey">Loading images...</p>
              </div>
            ) : albumImages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p className="text_color_grey">No images in this album yet.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {albumImages.map((image, index) => (
                  <div
                    key={image.id || index}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #ddd',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <img
                      src={normalizeImageUrl(image.url) || '/images/fashion-photo.jpg'}
                      alt={`${selectedAlbum.title} - Image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        display: 'block',
                        cursor: 'pointer'
                      }}
                      onError={(e) => {
                        e.target.src = '/images/fashion-photo.jpg';
                      }}
                      onClick={() => {
                        // Open image in full size (optional - can be enhanced with lightbox)
                        window.open(normalizeImageUrl(image.url), '_blank');
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={handleCloseBookingModal}
        profile={getProfileDataForModal()}
      />

    </>
  );
}

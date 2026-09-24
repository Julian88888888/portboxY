import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile, useProfileByUsername } from '../hooks/useProfile';
import { getAvatarUrl, getHeaderUrl } from '../services/profileService';
import { getAlbums, getAlbumImages, normalizeImageUrl } from '../services/albumsService';
import { getCustomLinks } from '../services/customLinksService';
import BookingModal from './BookingModal';
import { formatJobType, isModelJobType } from '../utils/formatJobType';
import { getDisplayAge } from '../utils/dateOfBirth';
import { ALBUM_PLACEHOLDER, getAlbumCoverSrc } from '../utils/albumPlaceholder';
import {
  getAlbumCardGridStyle,
  getImageThumbGridStyle,
  normalizeDisplaySize,
  shouldShowDisplaySizeBadge,
} from '../utils/displaySize';
import { formatEthnicityLabel } from '../utils/ethnicity';
import { formatNationalityDisplay } from '../utils/nationality';
import { formatLanguageDisplay } from '../utils/languages';
import { formatBodyTypeLabel } from '../utils/bodyType';
import { formatSkinComplexionLabel } from '../utils/skinComplexion';
import { formatBodyModificationDisplay } from '../utils/bodyModification';
import { formatEyeColorLabel } from '../utils/eyeColor';
import { formatIndustryLabel } from '../utils/industry';
import { formatSkillLevelLabel } from '../utils/skillLevel';
import { formatNicheDisplay } from '../utils/availableFor';
import { formatUnitLabel, formatHeightDisplay } from '../utils/unitLabels';
import { SocialIcon, listFilledSocialLinks } from '../utils/socialIcons';
import { DEFAULT_DOCUMENT_TITLE, formatProfileDocumentTitle } from '../utils/documentTitle';
import {
  BOOKING_AVAILABLE_FOR_IDS,
  BookingAvailableForIcon,
  formatBookingAvailableForLabel,
  normalizeBookingAvailableForTags,
} from '../utils/bookingAvailableFor';

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
  const { username: usernameSegment } = useParams();
  // Path is /:username so /@dev yields param "@dev"; strip leading @ for API lookup
  const urlUsername = usernameSegment
    ? usernameSegment.replace(/^@+/, '').trim() || undefined
    : undefined;
  const { user } = useAuth();
  
  // If username is in URL, get public profile; otherwise get current user's profile
  const { data: currentUserProfile } = useProfile();
  const { data: publicProfile, isLoading: publicProfileLoading } = useProfileByUsername(urlUsername);
  
  // Use public profile if username is in URL, otherwise use current user's profile
  const profile = urlUsername ? publicProfile : currentUserProfile;
  const isPublicProfile = !!urlUsername;
  const isViewingOwnPublicProfile = !!(user?.id && profile?.id && user.id === profile.id);
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumImages, setAlbumImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [customLinks, setCustomLinks] = useState([]);
  const [customLinksLoading, setCustomLinksLoading] = useState(false);

  // Profile owner values only — never leak logged-in viewer metadata onto other @username pages
  const getUserValue = (field, defaultValue = '') => {
    const stats = profile?.personal_stats;
    if (stats && typeof stats === 'object' && Object.prototype.hasOwnProperty.call(stats, field)) {
      const fromPersonal = stats[field];
      if (Array.isArray(fromPersonal)) return fromPersonal;
      if (fromPersonal !== undefined && fromPersonal !== null && fromPersonal !== '') {
        return fromPersonal;
      }
    }
    if (profile?.[field] !== undefined && profile[field] !== null && profile[field] !== '') {
      return profile[field];
    }
    if (isViewingOwnPublicProfile || !isPublicProfile) {
      return user?.[field] || user?.user_metadata?.[field] || defaultValue;
    }
    return defaultValue;
  };

  useEffect(() => {
    const accountName = String(
      getUserValue('display_name', '') || getUserValue('username', '') || ''
    )
      .trim()
      .replace(/^@+/, '');
    document.title = formatProfileDocumentTitle(accountName);
    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE;
    };
  }, [profile, user, isPublicProfile, isViewingOwnPublicProfile]);

  // Body measurements (height, bust, etc.) — only this profile owner's toggle
  const shouldShowModelStats = () => {
    if (profile?.show_model_stats !== undefined) {
      return profile.show_model_stats !== false;
    }
    if (profile?.showModelStats !== undefined) {
      return profile.showModelStats !== false;
    }
    if (isViewingOwnPublicProfile && user?.user_metadata?.showModelStats === false) {
      return false;
    }
    return true;
  };

  // Book Me master — profile owner only (never viewer session)
  const shouldShowBookMeButton = () => {
    if (profile?.show_book_me_button === false) return false;
    if (profile?.showBookMeButton === false) return false;
    if (profile?.personal_stats?.showBookMeButton === false) return false;
    if (isViewingOwnPublicProfile) {
      if (user?.showBookMeButton === false) return false;
      if (user?.user_metadata?.showBookMeButton === false) return false;
    }
    return true;
  };

  /** Per-section Book Me — profile owner DB only; metadata only on own page. */
  const isBookMeSectionEnabled = (dbKey, metaKey) => {
    if (!shouldShowBookMeButton()) return false;
    if (profile?.[dbKey] === false) return false;
    if (isViewingOwnPublicProfile && user?.user_metadata?.[metaKey] === false) return false;
    return true;
  };

  const shouldShowBookMeProfileSection = () =>
    isBookMeSectionEnabled('show_book_me_profile_section', 'showBookMeProfileSection');
  const shouldShowBookMePortfolioSection = () =>
    isBookMeSectionEnabled('show_book_me_portfolio', 'showBookMePortfolioSection');
  const shouldShowBookMeLinksSection = () =>
    isBookMeSectionEnabled('show_book_me_links_section', 'showBookMeLinksSection');
  const shouldShowBookMeCustomLinksSection = () =>
    isBookMeSectionEnabled('show_book_me_custom_links_section', 'showBookMeCustomLinksSection');

  const canShowBookMeToVisitor = urlUsername && profile?.id && user?.id !== profile?.id;

  const shouldShowAvailableForTags = () => {
    if (profile?.show_available_for !== undefined) {
      return profile.show_available_for !== false;
    }
    if (profile?.showAvailableFor !== undefined) {
      return profile.showAvailableFor !== false;
    }
    if (isViewingOwnPublicProfile && user?.user_metadata?.showAvailableFor === false) {
      return false;
    }
    return true;
  };

  const getPublicAvailableForTags = () => {
    let raw = profile?.available_for_tags;
    if ((raw == null || raw === '') && isViewingOwnPublicProfile) {
      raw = user?.user_metadata?.availableForTags;
    }
    if (raw == null || raw === '') return [];
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        return [];
      }
    }
    if (!Array.isArray(raw)) return [];
    const selected = new Set(normalizeBookingAvailableForTags(raw));
    return BOOKING_AVAILABLE_FOR_IDS
      .filter((id) => selected.has(id))
      .map((id) => ({ id, label: formatBookingAvailableForLabel(id) }));
  };

  const getBookingsTitleDisplay = () => {
    if (profile?.bookings_title != null && String(profile.bookings_title).trim() !== '') {
      return profile.bookings_title;
    }
    if (isViewingOwnPublicProfile) {
      return user?.user_metadata?.bookingsTitle ?? 'BOOKINGS';
    }
    return profile?.bookings_title ?? 'BOOKINGS';
  };

  /** Master: BOOKINGS block — only this profile's show_bookings_title (works logged out). */
  const shouldShowBookingsWidget = () => {
    if (profile?.show_bookings_title === false) return false;
    if (profile?.personal_stats?.enableBookingsTitle === false) return false;
    if (isViewingOwnPublicProfile && user?.user_metadata?.enableBookingsTitle === false) {
      return false;
    }
    return true;
  };

  const getHometownDisplay = () => {
    const fromProfile = profile?.hometown;
    if (fromProfile != null && String(fromProfile).trim() !== '') {
      return String(fromProfile).trim();
    }
    if (isViewingOwnPublicProfile) {
      return String(user?.user_metadata?.hometown ?? '').trim();
    }
    return '';
  };

  const shouldShowHometownPublic = () => {
    if (profile?.show_hometown !== undefined) {
      return profile.show_hometown !== false;
    }
    if (isViewingOwnPublicProfile && user?.user_metadata?.showHometown === false) {
      return false;
    }
    return true;
  };

  const getBookingDescriptionDisplay = () => {
    const fromProfile = profile?.booking_description;
    if (fromProfile != null && String(fromProfile).trim() !== '') {
      return String(fromProfile).trim();
    }
    if (isViewingOwnPublicProfile) {
      return String(user?.user_metadata?.bookingDescription ?? '').trim();
    }
    return '';
  };

  const shouldShowBookingDescriptionPublic = () => {
    if (profile?.show_booking_description !== undefined) {
      return profile.show_booking_description !== false;
    }
    if (isViewingOwnPublicProfile && user?.user_metadata?.showRequestDescription === false) {
      return false;
    }
    return true;
  };

  const hasPublicBookingsBlock =
    shouldShowBookingsWidget() &&
    ((String(getBookingsTitleDisplay()).trim() !== '') ||
      (shouldShowHometownPublic() && getHometownDisplay() !== '') ||
      (shouldShowBookingDescriptionPublic() && getBookingDescriptionDisplay() !== '') ||
      (shouldShowAvailableForTags() && getPublicAvailableForTags().length > 0));

  const shouldShowBookMeInLinksArea =
    shouldShowBookMeLinksSection() && canShowBookMeToVisitor;

  // Social icon row — profile owner only (works logged out via DB)
  const shouldShowSocialLinks = () => {
    if (profile?.show_social_links === false) return false;
    if (profile?.showSocialLinks === false) return false;
    if (profile?.personal_stats?.showSocialLinks === false) return false;
    if (isViewingOwnPublicProfile) {
      if (user?.showSocialLinks === false) return false;
      if (user?.user_metadata?.showSocialLinks === false) return false;
    }
    return true;
  };

  const getSocialLinksList = () => {
    const fromProfile =
      profile?.social_links ||
      profile?.socialLinks ||
      profile?.personal_stats?.socialLinks ||
      {};
    const fromOwnerSession =
      isViewingOwnPublicProfile || !isPublicProfile
        ? user?.socialLinks || user?.user_metadata?.socialLinks || {}
        : {};
    const raw =
      fromProfile && typeof fromProfile === 'object' && Object.values(fromProfile).some(Boolean)
        ? fromProfile
        : fromOwnerSession;
    return listFilledSocialLinks(raw);
  };

  // Check if Profile Stats (INDUSTRY, STATUS, MARKETS, NICHE) should be shown — profile owner only
  const shouldShowProfileStats = () => {
    if (profile?.show_profile_stats !== undefined) {
      return profile.show_profile_stats !== false;
    }
    if (profile?.showProfileStats !== undefined) {
      return profile.showProfileStats !== false;
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

  // My Links section — profile owner setting only (must work logged out via DB)
  const shouldShowCustomLinksTitle = () => {
    if (profile?.show_custom_links_title === false) return false;
    if (profile?.showCustomLinksTitle === false) return false;
    if (profile?.personal_stats?.showCustomLinksTitle === false) return false;
    // Own page only: legacy auth metadata (before DB column existed)
    if (isViewingOwnPublicProfile) {
      if (user?.showCustomLinksTitle === false) return false;
      if (user?.user_metadata?.showCustomLinksTitle === false) return false;
    }
    return true;
  };

  const showLinksSection =
    hasPublicBookingsBlock ||
    shouldShowBookMeInLinksArea ||
    shouldShowCustomLinksTitle();

  // Get profile photo for public page (respects show_profile_photo toggle)
  const showProfilePhoto = profile?.show_profile_photo !== false;
  const resolveProfileImageUrl = () => {
    if (profile?.profile_photo_path) {
      return getAvatarUrl(profile.profile_photo_path);
    }
    if (user?.profilePhotos && user.profilePhotos.length > 0) {
      const mainPhoto = user.profilePhotos.find(photo => photo.isMain);
      return mainPhoto ? mainPhoto.url : user.profilePhotos[0].url;
    }
    return '/images/default-avatar.svg';
  };

  // Central avatar on public page only — hidden when toggle is off
  const profileImageUrl = showProfilePhoto ? resolveProfileImageUrl() : null;

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
    if (!user) return;
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const renderBookMeCta = () =>
    user ? (
      <a
        data-w-id="ee47a855-7715-a4cf-bb17-0acb8cc29f1d"
        href="#"
        className="button bookme_large w-button"
        onClick={handleOpenBookingModal}
      >
        Book Me
      </a>
    ) : (
      <span
        className="button bookme_large w-button"
        style={{ opacity: 0.6, cursor: 'not-allowed', pointerEvents: 'none' }}
        title="Sign in to book"
      >
        Book Me
      </span>
    );

  const profileJobType =
    profile?.job_type ||
    profile?.jobType ||
    (isViewingOwnPublicProfile || !isPublicProfile
      ? user?.job_type ||
        user?.jobType ||
        user?.user_metadata?.job_type ||
        user?.user_metadata?.jobType
      : '') ||
    '';
  const showFullModelStats = isModelJobType(profileJobType);

  // Get profile data for BookingModal (include model id for guest booking)
  const getProfileDataForModal = () => {
    if (!profile) return null;
    return {
      id: profile.id,
      displayName: getUserValue('display_name', 'User Name'),
      username: getUserValue('username'),
      jobType: getUserValue('job_type', 'Model'),
      description: getUserValue('description'),
      profileImage: resolveProfileImageUrl()
    };
  };

  // Load albums when profile is available
  useEffect(() => {
    const loadAlbums = async () => {
      if (!profile?.id) {
        setAlbums([]);
        setAlbumsLoading(false);
        return;
      }

      setAlbumsLoading(true);
      console.log('ModelPage: Loading albums for user', profile.id);
      try {
        const result = await getAlbums(profile.id);
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
  }, [profile?.id]);

  // Load custom links for the profile being viewed (works logged out too)
  useEffect(() => {
    const loadCustomLinks = async () => {
      if (!profile?.id) {
        setCustomLinks([]);
        setCustomLinksLoading(false);
        return;
      }

      setCustomLinksLoading(true);
      try {
        const result = await getCustomLinks(profile.id);
        if (result.success) {
          const enabledLinks = (result.data || [])
            .filter(link => link.enabled !== false)
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          console.log('ModelPage: Loaded', enabledLinks.length, 'custom links');
          setCustomLinks(enabledLinks);
        } else {
          console.error('ModelPage: Failed to load custom links:', result.error);
          setCustomLinks([]);
        }
      } catch (error) {
        console.error('ModelPage: Error loading custom links:', error);
        setCustomLinks([]);
      }
      setCustomLinksLoading(false);
    };

    loadCustomLinks();
  }, [profile?.id]);

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

  const visibleBookingTags = getPublicAvailableForTags();

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
          {profileImageUrl && (
          <div className="profile_wrapper" style={{ position: 'relative', zIndex: 1 }}>
            <img 
              src={profileImageUrl} 
              loading="lazy" 
              style={{opacity: 1, transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)", transformStyle: "preserve-3d"}} 
              data-w-id="30764f4a-1ca9-b0b6-0704-64b5f3b87ec8" 
              alt={user?.name || "Profile"} 
              className="prodile_image" 
              onError={(e) => {
                e.target.src = '/images/default-avatar.svg';
              }}
            />
          </div>
          )}
          <div className="text_wrapper text_align_center">
            <div className="flex_wrapper flex_center">
              <h3>{getUserValue('display_name', 'User Name')}</h3>
              <a href="#" className="button_icon accent_button small_btn w-inline-block">
                <div>{formatJobType(getUserValue('job_type', 'Model'))}</div>
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
            <label htmlFor="field-3">Budget</label>
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
        style={headerBackgroundUrl ? {
          backgroundImage: `linear-gradient(#ffffff05 82%, #f3f5f8bd 94%, #eef2f5), url('${headerBackgroundUrl}')`,
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
        } : {
          backgroundImage: 'none',
          backgroundColor: '#eef2f5',
          height: '120px',
          marginBottom: '0',
          paddingBottom: '0',
          display: 'block'
        }}
      ></section>
      <div className="section profile_sec">
        <div className="content_wrapper content_align_center">
          <div className={profileImageUrl ? 'spacing_48' : 'spacing_24'} />
          {profileImageUrl && (
          <div className="profile_wrapper">
            <img
              src={profileImageUrl}
              loading="lazy"
              data-w-id="a631810c-b7df-495c-c9a7-03835c973869"
              alt={user?.name || "Profile"}
              className="prodile_image"
              onError={(e) => {
                e.target.src = '/images/default-avatar.svg';
              }}
            />
          </div>
          )}
          {profileImageUrl && <div className="spacing_24" />}
          <div className="text_wrapper text_align_center">
            <div className="flex_wrapper flex_center">
              <h3>{getUserValue('display_name', 'User Name')}</h3>
              <a href="#" className="button_icon accent_button small_btn w-inline-block">
                <div>{formatJobType(getUserValue('job_type', 'Model'))}</div>
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
              <a
                key={platform}
                href={url}
                target={platform === 'email' ? undefined : '_blank'}
                rel={platform === 'email' ? undefined : 'noopener noreferrer'}
                className="icon_wrapper w-inline-block"
                aria-label={platform}
              >
                <div className="icon_24x24 w-embed">
                  <SocialIcon platform={platform} size={24} />
                </div>
              </a>
            ))}
          </div>
          )}
          {shouldShowSocialLinks() && getSocialLinksList().length > 0 && shouldShowProfileStats() && (
            <div className="spacing_24" />
          )}
          {shouldShowProfileStats() && (
          <div className="stats_wrap">
            <div className="stat_item">
              <div className="stat_title">INDUSTRY</div>
              <div className="stat_descript">{formatIndustryLabel(getUserValue('industry', ''))}</div>
            </div>
            <div className="stat_item">
              <div className="stat_title">STATUS</div>
              <div className="stat_descript">{formatSkillLevelLabel(getUserValue('status', '')) || '—'}</div>
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
              <div className="stat_title">NICHE</div>
              <div className="stat_descript">
                {formatNicheDisplay(getUserValue('availableFor', ''))}
              </div>
            </div>
          </div>
          )}
          <div className="spacing_24" />
          <div className="stat_container">
              <div className={`stats_wrap_bottom${showFullModelStats && shouldShowModelStats() ? '' : ' stats_wrap_bottom--compact'}`}>
                {showFullModelStats && shouldShowModelStats() && (
                  <>
                    <div className="stat_item">
                      <div className="stat_title">HEIGHT</div>
                      <div className="stat_descript">
                        {formatHeightDisplay(
                          getUserValue('heightFeet'),
                          getUserValue('heightInches'),
                          getUserValue('heightUnit')
                        )}
                      </div>
                    </div>
                    <div className="stat_item">
                      <div className="stat_title">WEIGHT</div>
                      <div className="stat_descript">
                        {getUserValue('weight')
                          ? `${getUserValue('weight')} ${formatUnitLabel(getUserValue('weightUnit'), 'lbs')}`
                          : '135 lbs'}
                      </div>
                    </div>
                    <div className="stat_item">
                      <div className="stat_title">BUST</div>
                      <div className="stat_descript">
                        {getUserValue('bust')
                          ? `${getUserValue('bust')}${getUserValue('cupSize') || getUserValue('bustSize', '')}${getUserValue('bustUnit') ? ` ${formatUnitLabel(getUserValue('bustUnit'))}` : ''}`
                          : '23A'}
                      </div>
                    </div>
                    <div className="stat_item">
                      <div className="stat_title">WAIST</div>
                      <div className="stat_descript">
                        {getUserValue('waist')
                          ? `${getUserValue('waist')} ${formatUnitLabel(getUserValue('waistUnit'), 'in')}`
                          : '26 in'}
                      </div>
                    </div>
                    <div className="stat_item">
                      <div className="stat_title">HIPS</div>
                      <div className="stat_descript">
                        {getUserValue('hips')
                          ? `${getUserValue('hips')} ${formatUnitLabel(getUserValue('hipsUnit'), 'in')}`
                          : '36 in'}
                      </div>
                    </div>
                    <div className="stat_item">
                      <div className="stat_title">SHOE</div>
                      <div className="stat_descript">
                        {getUserValue('shoe')
                          ? `${getUserValue('shoe')} ${formatUnitLabel(getUserValue('shoeUnit'), 'US')}`
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
                      <div className="stat_descript">
                        {formatEyeColorLabel(getUserValue('eyeColor', '')) || '—'}
                      </div>
                    </div>
                    <div className="stat_item">
                      <div className="stat_title">BODY TYPE</div>
                      <div className="stat_descript">
                        {formatBodyTypeLabel(getUserValue('bodyType', '')) || '—'}
                      </div>
                    </div>
                    <div className="stat_item">
                      <div className="stat_title">SKIN COMPLEXION</div>
                      <div className="stat_descript">
                        {formatSkinComplexionLabel(getUserValue('skinComplexion', '')) || '—'}
                      </div>
                    </div>
                    <div className="stat_item">
                      <div className="stat_title">BODY MODIFICATION</div>
                      <div className="stat_descript">
                        {formatBodyModificationDisplay(getUserValue('bodyModification', [])) || '—'}
                      </div>
                    </div>
                  </>
                )}
                <div className="stat_item">
                  <div className="stat_title">AGE</div>
                  <div className="stat_descript">{getDisplayAge(getUserValue('age', '26'))}</div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">GENDER</div>
                  <div className="stat_descript">{getUserValue('gender', 'Female')}</div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">ETHNICITY</div>
                  <div className="stat_descript">{formatEthnicityLabel(getUserValue('ethnicity', ''))}</div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">NATIONALITY</div>
                  <div className="stat_descript">
                    {formatNationalityDisplay(getUserValue('nationality', [])) || '—'}
                  </div>
                </div>
                <div className="stat_item">
                  <div className="stat_title">LANGUAGES</div>
                  <div className="stat_descript">
                    {formatLanguageDisplay(getUserValue('languages', [])) || '—'}
                  </div>
                </div>
              </div>
            </div>
          <div className="spacing_24" />
      {shouldShowBookMeProfileSection() && canShowBookMeToVisitor && (
        renderBookMeCta()
      )}
        </div>
      </div>
      {/* Portfolio Albums Section */}
      <div className="section portfolio_sec">
        <div className="content_wrapper">
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
            <div
              className="w-layout-grid blog_grid portfolio-albums-grid"
              style={{
                marginBottom: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gap: '20px',
              }}
            >
              {albums.map((album, index) => {
                const cardSizeStyle = getAlbumCardGridStyle(album.card_size);
                return (
                <div 
                  key={album.id || index} 
                  className="product_item w-inline-block" 
                  style={{ 
                    position: 'relative',
                    cursor: 'pointer',
                    gridColumn: cardSizeStyle.gridColumn,
                    width: '100%',
                  }}
                  onClick={() => handleAlbumClick(album)}
                >
                  <a 
                    href="#" 
                    className="product_item w-inline-block"
                    style={{ display: 'block', width: '100%' }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleAlbumClick(album);
                    }}
                  >
                    <div
                      className="product_image_wrapper"
                      style={{
                        width: '100%',
                        aspectRatio: cardSizeStyle.aspectRatio,
                        borderRadius: '20px',
                        overflow: 'hidden',
                        background: '#f3f4f6',
                      }}
                    >
                      <img 
                        src={getAlbumCoverSrc(album.cover_image_url, normalizeImageUrl)} 
                        alt={album.title} 
                        className="product_image fashionphoto"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.target.src = ALBUM_PLACEHOLDER;
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
              );
              })}
            </div>
          )}
          <div className="spacing_48"></div>
          {shouldShowBookMePortfolioSection() && canShowBookMeToVisitor && renderBookMeCta()}
        </div>
      </div>

      {showLinksSection && (
      <div className="section links_sec">
        <div className="content_wrapper largebanner_btn">
          {hasPublicBookingsBlock && (
            <div style={{ width: '100%', margin: '0 auto' }}>
              <div className="spacing_48"></div>
              {String(getBookingsTitleDisplay()).trim() !== '' && (
                <h4
                  style={{
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '17px',
                    letterSpacing: '0.02em',
                    margin: '0 0 20px 0',
                    color: '#111',
                  }}
                >
                  {getBookingsTitleDisplay()}
                </h4>
              )}
              {shouldShowHometownPublic() && getHometownDisplay() !== '' && (
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#111', marginBottom: '6px' }}>
                    Hometown City
                  </div>
                  <div className="text_color_grey" style={{ fontSize: '15px' }}>
                    {getHometownDisplay()}
                  </div>
                </div>
              )}
              {shouldShowBookingDescriptionPublic() && getBookingDescriptionDisplay() !== '' && (
                <p
                  className="text_color_grey text_width_medium"
                  style={{
                    textAlign: 'center',
                    fontSize: '15px',
                    lineHeight: 1.55,
                    margin: '0 auto 24px',
                    maxWidth: '100%',
                  }}
                >
                  {getBookingDescriptionDisplay()}
                </p>
              )}
              {shouldShowAvailableForTags() && visibleBookingTags.length > 0 && (
                <>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '16px',
                      color: '#111',
                      marginBottom: '12px',
                      textAlign: 'left',
                    }}
                  >
                    Available For
                  </div>
                  <div
                    className="flex_wrapper flex_center"
                    style={{
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: '8px',
                      justifyContent: 'center',
                    }}
                  >
                    {visibleBookingTags.map(({ id, label }) => (
                      <div
                        key={id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '999px',
                          fontWeight: 600,
                          fontSize: '14px',
                          backgroundColor: '#783FF3',
                          color: '#fff',
                        }}
                      >
                        <span>{label}</span>
                        <BookingAvailableForIcon type={id} color="#ffffff" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {shouldShowBookMeInLinksArea && (
            <div style={{ width: '100%', margin: '0 auto', textAlign: 'center' }}>
              {hasPublicBookingsBlock ? (
                <div className="spacing_24" />
              ) : (
                <div className="spacing_48" />
              )}
              {renderBookMeCta()}
            </div>
          )}
          {shouldShowCustomLinksTitle() && (
            <>
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
              {shouldShowBookMeCustomLinksSection() && canShowBookMeToVisitor && (
                <>
                  <div className="spacing_32"></div>
                  <div style={{ textAlign: 'center', width: '100%' }}>{renderBookMeCta()}</div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      )}

      <div className="section footer_sec">
        <div className="content_wrapper content_align_center">
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
            setLightboxIndex(null);
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
                  setLightboxIndex(null);
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
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '12px'
              }}>
                {albumImages.map((image, index) => {
                  const thumbStyle = getImageThumbGridStyle(image.display_size);
                  return (
                  <button
                    key={image.id || index}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                      padding: 0,
                      margin: 0,
                      background: '#f3f4f6',
                      cursor: 'pointer',
                      width: '100%',
                      gridColumn: thumbStyle.gridColumn,
                      aspectRatio: thumbStyle.aspectRatio,
                    }}
                  >
                    <img
                      src={normalizeImageUrl(image.url) || ALBUM_PLACEHOLDER}
                      alt={`${selectedAlbum.title} - Image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.target.src = ALBUM_PLACEHOLDER;
                      }}
                    />
                    {shouldShowDisplaySizeBadge(image.display_size) && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'rgba(0,0,0,0.55)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {normalizeDisplaySize(image.display_size)}
                      </span>
                    )}
                  </button>
                );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Album image lightbox */}
      {lightboxIndex !== null && albumImages[lightboxIndex] && (
        <div
          className="modal-overlay"
          onClick={() => setLightboxIndex(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '24px'
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close image"
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '36px',
              lineHeight: 1,
              cursor: 'pointer',
              zIndex: 1
            }}
          >
            ×
          </button>
          {albumImages.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev - 1 + albumImages.length) % albumImages.length);
                }}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  fontSize: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev + 1) % albumImages.length);
                }}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  fontSize: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ›
              </button>
            </>
          )}
          <img
            src={normalizeImageUrl(albumImages[lightboxIndex].url) || ALBUM_PLACEHOLDER}
            alt={`${selectedAlbum?.title || 'Album'} - Image ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.target.src = ALBUM_PLACEHOLDER;
            }}
            style={{
              maxWidth: 'min(96vw, 1100px)',
              maxHeight: '88vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.45)'
            }}
          />
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

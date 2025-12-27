import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { getAvatarUrl, getHeaderUrl } from '../services/profileService';
import { getAlbums, getAlbumImages, normalizeImageUrl } from '../services/albumsService';

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

export default function JobRequestPopup({ onEditProfile }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumImages, setAlbumImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  
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

  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
    }
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
              <h3>Mary Adams</h3>
              <div className="icon_20x20 w-embed">
                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.50033 10.5003L9.16699 12.167L12.917 8.41699M6.1118 3.68258C6.78166 3.62912 7.41758 3.36571 7.92905 2.92984C9.12258 1.91271 10.8781 1.91271 12.0716 2.92984C12.5831 3.36571 13.219 3.62912 13.8888 3.68258C15.4521 3.80732 16.6933 5.04861 16.8181 6.6118C16.8716 7.28166 17.1349 7.91758 17.5708 8.42905C18.5879 9.62258 18.5879 11.3781 17.5708 12.5716C17.1349 13.0831 16.8716 13.719 16.8181 14.3888C16.6933 15.9521 15.4521 17.1933 13.8888 17.3181C13.219 17.3716 12.5831 17.6349 12.0716 18.0708C10.8781 19.0879 9.12258 19.0879 7.92905 18.0708C7.41758 17.6349 6.78166 17.3716 6.1118 17.3181C4.54861 17.1933 3.30732 15.9521 3.18258 14.3888C3.12912 13.719 2.86571 13.0831 2.42984 12.5716C1.41271 11.3781 1.41271 9.62258 2.42984 8.42905C2.86571 7.91758 3.12912 7.28166 3.18258 6.6118C3.30732 5.04861 4.54861 3.80732 6.1118 3.68258Z" stroke="#783FF3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <a href="#" className="button_icon accent_button small_btn w-inline-block">
                <div>Model</div>
              </a>
            </div>
            <div className="spacing_8"></div>
            <p className="username_txt">@maryadams</p>
            <p className="text_color_grey text_width_medium">I am a professional model with many years of experience working for top brands all over the world.</p>
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
              <h3>Mary Adams</h3>
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
                <div>Model</div>
              </a>
            </div>
            <div className="spacing_8" />
            <p className="username_txt">@maryadams</p>
            <p className="text_color_grey text_width_medium">
              I am a professional model with many years of experience working for top brands all over the world.
            </p>
          </div>
          <div className="spacing_24" />
          <div className="flex_wrapper flex_center">
            {/* Social icons: keep as-is, or split into their own component */}
            <a href="https://twitter.com/jmsbaduor" target="_blank" className="icon_wrapper w-inline-block" rel="noopener noreferrer">
              {/* SVG Twitter */}
              {/* ...SVG code */}
            </a>
            <a href="https://www.linkedin.com/in/jmsbaduor/" target="_blank" className="icon_wrapper w-inline-block" rel="noopener noreferrer">
              {/* SVG LinkedIn */}
              {/* ...SVG code */}
            </a>
            <a href="https://www.instagram.com/jmsbaduor/" target="_blank" className="icon_wrapper w-inline-block" rel="noopener noreferrer">
              {/* SVG Instagram */}
              {/* ...SVG code */}
            </a>
            {/* ...Repeat for other icons, see your original HTML */}
          </div>
          <div className="columns industry_stats w-row">
            <div className="w-col w-col-3 w-col-small-6 w-col-tiny-tiny-stack">
              <div className="text_heading">INDUSTRY</div>
              <div className="text_paragraph">Fashion</div>
              <div className="text_heading">STATUS</div>
              <div className="text_paragraph">Professional</div>
            </div>
            <div className="w-col w-col-3 w-col-small-6 w-col-tiny-tiny-stack">
              <div className="text_heading">AGE</div>
              <div className="text_paragraph">23</div>
              <div className="text_heading">GENDER</div>
              <div className="text_paragraph">Female</div>
            </div>
            <div className="w-col w-col-3 w-col-small-6 w-col-tiny-tiny-stack">
              <div className="text_heading">MARKETS</div>
              <div className="text_paragraph">Miami</div>
              <div className="text_paragraph">Los Angeles</div>
              <div className="text_paragraph">New York</div>
            </div>
            <div className="w-col w-col-3 w-col-small-6 w-col-tiny-tiny-stack">
              <div className="text_heading">AVAILABLE FOR</div>
              <div className="text_paragraph">Beauty, Editorial, Glamour, Print</div>
            </div>
          </div>
          <div className="spacing_24" />
          <div className="spacing_24" />
          <a data-w-id="ee47a855-7715-a4cf-bb17-0acb8cc29f1d" href="#" className="button bookme_large w-button" onClick={handleOpenPopup}>
            Book Me
          </a>
          <div className="spacing_48" />
        </div>
      </div>
      <div className="section portfolio_sec">
        <div className="w-layout-blockcontainer content_wrapper w-container">
          <h4 className="section_title">Portfolio</h4>
          <div className="spacing_24"></div>
          <div className="w-layout-hflex portfolio_menu">
            {[
              { label: "Headshots" },
              { label: "High Fashion" },
              { label: "Glamour" },
            ].map((item, idx) => (
              <a href="#" key={item.label} className="flex_wrapper flex_distribute link_block w-inline-block">
                <div>{item.label}</div>
                <div className="icon_24x24 w-embed">
                  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 8H4m0-2v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"></path>
                  </svg>
                </div>
              </a>
            ))}
          </div>
          <div className="w-layout-grid grid">
            {user?.profilePhotos && user.profilePhotos.length > 0 ? (
              // Відображаємо завантажені фото (максимум 10)
              user.profilePhotos.slice(0, 10).map((photo, index) => (
                <div 
                  key={photo.id || index} 
                  className={`w-layout-vflex porfolio_block ${index === user.profilePhotos.length - 1 && user.profilePhotos.length <= 6 ? 'video' : ''}`}
                  style={{
                    backgroundImage: `url(${photo.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '200px',
                    position: 'relative'
                  }}
                >
                  <img
                    src={photo.url}
                    loading="lazy"
                    alt={`Portfolio photo ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.backgroundImage = 'none';
                      e.target.parentElement.style.backgroundColor = '#f0f0f0';
                    }}
                  />
                </div>
              ))
            ) : (
              // Якщо фото немає, показуємо placeholder
              <>
                <img
                  src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg"
                  loading="lazy"
                  id="w-node-_7fea4455-e7b7-7038-d03c-918e38a8699f-6c6f7e32"
                  alt="No photos uploaded"
                />
                <div id="w-node-b007c895-5461-0de8-3c51-791fb88399b6-6c6f7e32" className="w-layout-vflex porfolio_block"></div>
                <div id="w-node-_681e0659-b6be-4959-a9ba-400c01152908-6c6f7e32" className="w-layout-vflex porfolio_block"></div>
                <div id="w-node-_7481c853-9136-1292-bd8c-6d310a090f92-6c6f7e32" className="w-layout-vflex porfolio_block"></div>
                <div id="w-node-_172ed7cb-28f2-ae96-2994-7dd9882f0222-6c6f7e32" className="w-layout-vflex porfolio_block"></div>
                <div id="w-node-_4a2a0a39-098c-8a78-4f12-aa988b774ab9-6c6f7e32" className="w-layout-vflex porfolio_block"></div>
                <div id="w-node-_47efbc6e-6e26-8165-e44b-c4b8cdfd9ba5-6c6f7e32" className="w-layout-vflex porfolio_block video"></div>
              </>
            )}
          </div>
          <div className="spacing_24"></div>
          <div className="w-layout-blockcontainer stat_container w-container">
            <div className="columns personal_stats w-row">
              <div className="w-col w-col-2 w-col-small-2 w-col-tiny-6">
                <div className="text_heading">HEIGHT</div>
                <div className="text_paragraph">5'11"</div>
              </div>
              <div className="w-col w-col-2 w-col-small-2 w-col-tiny-6">
                <div className="text_heading">WEIGHT</div>
                <div className="text_paragraph">135 lbs</div>
              </div>
              <div className="w-col w-col-2 w-col-small-2 w-col-tiny-6">
                <div className="text_heading">BUST</div>
                <div className="text_paragraph">23A</div>
              </div>
              <div className="w-col w-col-2 w-col-small-2 w-col-tiny-6">
                <div className="text_heading">WAIST</div>
                <div className="text_paragraph">26</div>
              </div>
              <div className="w-col w-col-2 w-col-small-2 w-col-tiny-6">
                <div className="text_heading">HIPS</div>
                <div className="text_paragraph">36</div>
              </div>
              <div className="w-col w-col-2 w-col-small-2 w-col-tiny-6">
                <div className="text_heading">SHOE</div>
                <div className="text_paragraph">7 US</div>
              </div>
            </div>
            <div className="spacing_24"></div>
            <div className="spacing_24"></div>
          </div>
          <div className="spacing_24"></div>
          <div className="line_divider"></div>
          <div className="spacing_48"></div>
        </div>
      </div>
      <div data-w-id="c75f6ea3-6352-a477-d455-b928501a0b27" className="section booking_sec">
        <div className="content_wrapper">
          {/* Availability */}
          <div data-w-id="585a1cc3-ae85-d2f1-6c2e-069e3e9fce14" className="availability_sec">
            <div className="content_wrapper">
              <h4 className="section_title">Weekly Availability (overview)</h4>
              <div className="spacing_24"></div>
              <div className="w-layout-grid availability_grid">
                {days.map((day, idx) => (
                  <div className="availability_column" key={day.key}>
                    <div className="availability_graph_item">
                      <div className="graph_bar"></div>
                      <div className={`graph_bar available ${day.key}`}>
                        <div className="graph_text">{day.hours}</div>
                      </div>
                    </div>
                    <div className="small_text font_weight_bold">{day.label}</div>
                  </div>
                ))}
              </div>
              <div className="spacing_24"></div>
              <p className="text_color_muted">* Gray areas indicate unavailability</p>
              <div className="spacing_24"></div>
              <div className="line_divider"></div>
            </div>
          </div>
          <div className="spacing_24"></div>
          {/* Travel */}
          {/* <h4 className="section_title">Upcoming Travel Dates</h4> */}
          <div className="spacing_24"></div>
          {/* <div className="w-layout-grid _3_col_grid">
            {travels.map((t) => (
              <a href="#" className="flex_wrapper flex_vertical card_link w-inline-block" key={t.city}>
                <div className="w-layout-hflex flex-block-2">
                  <div className="dates_travel">{t.city}</div>
                  <img
                    src={t.img}
                    loading="lazy"
                    sizes="(max-width: 512px) 100vw, 512px"
                    srcSet={t.imgset}
                    alt=""
                    className="icon_32x32"
                  />
                </div>
                <div className="w-layout-hflex flex-block-2">
                  <div className="dates_travel">{t.date}</div>
                </div>
              </a>
            ))}
          </div> */}
          <div className="spacing_24"></div>
          <div className="line_divider"></div>
          <div className="spacing_24"></div>
          {/* City */}
          <h4 className="section_title">Current City</h4>
          <p className="text_color_grey booking_des">Miami, USA</p>
          <div className="spacing_24"></div>
          {/* Available For */}
          <h4 className="section_title">Currently Available For</h4>
          <div className="spacing_24"></div>
          <div className="w-layout-hflex flex-block-4">
            <a href="#" className="flex_wrapper flex_distribute link_block small_choice w-inline-block">
              <div>Photoshoots</div>
              <div className="icon_24x24 w-embed">
                {/* SVG ICON */}
                <svg className="w-6 h-6 text-gray-800 dark:text-white" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M4 18V8a1 1 0 0 1 1-1h1.5l1.707-1.707A1 1 0 0 1 8.914 5h6.172a1 1 0 0 1 .707.293L17.5 7H19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"></path>
                  <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
                </svg>
              </div>
            </a>
            <a href="#" className="flex_wrapper flex_distribute link_block small_choice w-inline-block">
              <div>Acting</div>
              <div className="icon_24x24 w-embed">
                <svg className="w-6 h-6 text-gray-800 dark:text-white" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm7 11-6-2V9l6-2v10Z"></path>
                </svg>
              </div>
            </a>
            <a href="#" className="flex_wrapper flex_distribute link_block small_choice w-inline-block">
              <div>Runway</div>
              <div className="icon_24x24 w-embed">
                <svg className="w-6 h-6 text-gray-800 dark:text-white" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M9 5h-.16667c-.86548 0-1.70761.28071-2.4.8L3.5 8l2 3.5L8 10v9h8v-9l2.5 1.5 2-3.5-2.9333-2.2c-.6924-.51929-1.5346-.8-2.4-.8H15M9 5c0 1.5 1.5 3 3 3s3-1.5 3-3M9 5h6"></path>
                </svg>
              </div>
            </a>
            <a href="#" className="flex_wrapper flex_distribute link_block small_choice w-inline-block">
              <div>Promos</div>
              <div className="icon_24x24 w-embed">
                <svg className="w-6 h-6 text-gray-800 dark:text-white" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 9H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6m0-6v6m0-6 5.419-3.87A1 1 0 0 1 18 5.942v12.114a1 1 0 0 1-1.581.814L11 15m7 0a3 3 0 0 0 0-6M6 15h3v5H6v-5Z"></path>
                </svg>
              </div>
            </a>
          </div>
          <div className="spacing_24"></div>
        </div>
        {/* Job Request */}
        <div className="content_wrapper">
          <h4 className="section_title">Send Job Request</h4>
          <div className="spacing_24"></div>
          <p className="text_color_grey booking_des">Currently accepting all paid job bookings.</p>
          <a data-w-id="809c8fa7-34ba-ce84-d31a-5cbb0d721232" href="#" className="link_btn_large w-inline-block">
            <div className="highlight_card white bookme_card">
              <h3 className="bookme_btnheading">BOOK ME+</h3>
              <div className="spacing_16"></div>
              <div className="flex_wrapper flex_distribute">
                <div>Usually responds ~2 hours</div>
                <div className="icon_24x24 w-embed">
                  <svg className="w-6 h-6 text-gray-800 dark:text-white" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"></path>
                  </svg>
                </div>
              </div>
              <div className="spacing_4"></div>
            </div>
          </a>
          <div className="spacing_48"></div>
          <div className="line_divider"></div>
        </div>
      </div>
      <div className="section">
        <div className="content_wrapper">
          <h4 className="section_title">PORTFOLIO</h4>
          <div className="spacing_24"></div>
          {albumsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p className="text_color_grey">Loading albums...</p>
            </div>
          ) : albums && albums.length > 0 ? (
            <>
              <div className="w-layout-grid blog_grid">
                {albums.map((album, index) => (
                  <a 
                    key={album.id || index} 
                    href="#" 
                    className="product_item w-inline-block"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAlbumClick(album);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="product_image_wrapper">
                      <img 
                        src={normalizeImageUrl(album.cover_image_url) || '/images/fashion-photo.jpg'} 
                        loading="lazy" 
                        sizes="(max-width: 600px) 100vw, 600px" 
                        alt={album.title || 'Album'} 
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
                    <p className="text_color_grey">{album.description || 'Portfolio Work'}</p>
                  </a>
                ))}
              </div>
              <div className="spacing_32"></div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p className="text_color_grey">No albums available yet.</p>
              <p className="text_color_grey" style={{ fontSize: '14px', marginTop: '8px' }}>
                Go to Dashboard → Portfolio → Image Albums to create albums
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px', fontSize: '12px' }}>
                  <p style={{ margin: 0, color: '#666' }}>Debug Info:</p>
                  <p style={{ margin: '4px 0', color: '#666' }}>Albums count: {albums?.length || 0}</p>
                  <p style={{ margin: '4px 0', color: '#666' }}>Loading: {albumsLoading ? 'true' : 'false'}</p>
                  <p style={{ margin: '4px 0', color: '#666' }}>API URL: {process.env.REACT_APP_API_URL || 'http://localhost:5002/api'}</p>
                </div>
              )}
            </div>
          )}
          <div className="spacing_48">
            <a data-w-id="a31dac47-4806-1da6-f61f-71f75a9e52f5" href="#" className="button bookme_large w-button">Book Me</a>
          </div>
          <div className="line_divider"></div>
          <div className="spacing_48"></div>
        </div>
      </div>
      <div className="section links_sec">
        <div className="content_wrapper largebanner_btn">
          <div className="spacing_48"></div>
          <h4 className="section_title links_headinng">My Links</h4>
          <div className="spacing_24"></div>
          <div className="w-layout-grid link_cloud_grid">
            {user?.links && user.links.length > 0 ? (
              user.links.map((link, index) => (
                <a
                  key={link.id || index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex_wrapper flex_distribute link_block w-inline-block"
                >
                  {link.iconUrl && (
                    <img src={link.iconUrl} loading="lazy" alt="" className="icon_32x32" />
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
          <div className="spacing_24"></div>
          {/* <div className="w-layout-grid _3_col_grid">
            <a href="#" className="flex_wrapper flex_vertical card_link photo_blk w-inline-block">
              <img src="images/Spotify_icon.png" loading="lazy" alt="" className="icon_32x32" />
              <div className="link_des">My New Song</div>
            </a>
            <a href="#" className="flex_wrapper flex_vertical card_link photo_blk w-inline-block">
              <img src="images/vimeo-logo.png" loading="lazy" alt="" className="icon_32x32" />
              <div className="link_des">Daily Videos</div>
            </a>
            <a href="#" className="flex_wrapper flex_vertical card_link photo_blk w-inline-block">
              <img src="images/Square_Cash_app_logo.png" loading="lazy" alt="" className="icon_32x32" />
              <div className="link_des">Gift Me</div>
            </a>
          </div> */}
          <div className="spacing_48"></div>
          {/* <a href="#" className="flex_wrapper flex_vertical card_link photo_blk largelink w-inline-block">
            <img src="images/Spotify_icon.png" loading="lazy" alt="" className="icon_32x32" />
            <div className="link_des">My New Song</div>
          </a> */}
          <div className="spacing_24"></div>
          {/* <div style={{ paddingTop: "56.17021276595745%" }} className="w-embed-youtubevideo youtube">
            <iframe
              src="https://www.youtube.com/embed/uV2BhlTnG8A?rel=0&amp;controls=1&amp;autoplay=0&amp;mute=0&amp;start=0"
              frameBorder="0"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "auto",
              }}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Get To Know Me! Photoshoot BTS"
            />
          </div> */}
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
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            overflow: 'auto'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, marginBottom: '8px' }}>{selectedAlbum.title || 'Untitled Album'}</h2>
                {selectedAlbum.description && (
                  <p className="text_color_grey" style={{ margin: 0 }}>{selectedAlbum.description}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setIsAlbumModalOpen(false);
                  setSelectedAlbum(null);
                  setAlbumImages([]);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '32px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '40px',
                  height: '40px',
                  color: '#333',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </div>

            {imagesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p className="text_color_grey">Loading images...</p>
              </div>
            ) : albumImages.length > 0 ? (
              <>
                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                  <p className="text_color_grey" style={{ margin: 0 }}>
                    {albumImages.length} {albumImages.length === 1 ? 'image' : 'images'} in this album
                  </p>
                </div>
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                    gap: '16px',
                    marginBottom: '24px'
                  }}
                >
                  {albumImages.map((image, index) => (
                    <div 
                      key={image.id || index}
                      style={{
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '100%',
                        overflow: 'hidden',
                        borderRadius: '8px',
                        background: '#f0f0f0',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onClick={() => {
                        // Open image in full screen
                        window.open(normalizeImageUrl(image.url), '_blank');
                      }}
                    >
                      <img 
                        src={normalizeImageUrl(image.url) || '/images/fashion-photo.jpg'} 
                        alt={`${selectedAlbum.title} - Image ${index + 1}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          console.error('Failed to load image in ModelPage:', image.url, 'Normalized:', normalizeImageUrl(image.url));
                          e.target.src = '/images/fashion-photo.jpg';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully in ModelPage:', normalizeImageUrl(image.url));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p className="text_color_grey">No images in this album yet.</p>
                <p className="text_color_grey" style={{ fontSize: '14px', marginTop: '8px' }}>
                  Go to Dashboard → Portfolio → Image Albums to add images
                </p>
              </div>
            )}

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                onClick={() => {
                  setIsAlbumModalOpen(false);
                  setSelectedAlbum(null);
                  setAlbumImages([]);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Close
              </button>
            </div>
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
          <div className="text_wrapper text_align_center">
            <p className="text_color_grey text_width_medium"><strong>©</strong>2025 Model Link Portfolio</p>
          </div>
          <div className="spacing_48"></div>
          <div className="spacing_24"></div>
        </div>
      </div>

    </>
  );
}

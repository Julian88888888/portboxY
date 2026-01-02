import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function EditProfile() {
  const { user, updateProfile, uploadProfilePhotos, deleteProfilePhoto, setMainPhoto, updateLinks } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    industry: '',
    status: '',
    age: '',
    gender: '',
    markets: '',
    availableFor: '',
    height: '',
    weight: '',
    bust: '',
    waist: '',
    hips: '',
    shoe: '',
    currentCity: '',
    weeklyAvailability: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    upcomingTravel: [],
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
      onlyfans: '',
      spotify: '',
      vimeo: '',
      cashapp: ''
    },
    customLinks: []
  });
  const [links, setLinks] = useState([]);
  const [editingLink, setEditingLink] = useState(null);
  const [linkForm, setLinkForm] = useState({ title: '', url: '', iconUrl: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const [focusedDay, setFocusedDay] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        industry: user.industry || '',
        status: user.status || '',
        age: user.age || '',
        gender: user.gender || '',
        markets: user.markets || '',
        availableFor: user.availableFor || '',
        height: user.height || '',
        weight: user.weight || '',
        bust: user.bust || '',
        waist: user.waist || '',
        hips: user.hips || '',
        shoe: user.shoe || '',
        currentCity: user.currentCity || '',
        weeklyAvailability: user.weeklyAvailability || {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: ''
        },
        upcomingTravel: user.upcomingTravel || [],
        socialLinks: user.socialLinks || {
          instagram: '',
          twitter: '',
          linkedin: '',
          onlyfans: '',
          spotify: '',
          vimeo: '',
          cashapp: ''
        },
        customLinks: user.customLinks || []
      });
      // Load links
      if (user?.links) {
        setLinks(user.links);
      }
    }
  }, [user]);

  // Handle clicks outside calendar to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCalendar) {
        const calendarElement = event.target.closest('[data-calendar-popup]');
        const inputElement = event.target.closest('input[readonly]');
        
        if (!calendarElement && !inputElement) {
          setShowCalendar(false);
          setFocusedDay(null);
        }
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCalendar]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (day, value) => {
    setFormData(prev => ({
      ...prev,
      weeklyAvailability: {
        ...prev.weeklyAvailability,
        [day]: value
      }
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  // Links management functions
  const handleAddLink = () => {
    setEditingLink(null);
    setLinkForm({ title: '', url: '', iconUrl: '' });
  };

  const handleEditLink = (link, index) => {
    setEditingLink(index);
    setLinkForm({
      title: link.title || '',
      url: link.url || '',
      iconUrl: link.iconUrl || '',
    });
  };

  const handleDeleteLink = async (index) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      const updatedLinks = links.filter((_, i) => i !== index);
      setLinks(updatedLinks);
      
      // Save to database immediately
      const result = await updateLinks(updatedLinks);
      if (result.success) {
        setMessage({ type: 'success', text: 'Link deleted successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete link' });
        // Revert on error
        setLinks(links);
      }
    }
  };

  const handleLinkFormChange = (e) => {
    const { name, value } = e.target;
    setLinkForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveLink = async () => {
    if (!linkForm.title || !linkForm.url) {
      alert('Please fill in title and URL');
      return;
    }

    // Validate URL
    try {
      new URL(linkForm.url);
    } catch {
      alert('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    let updatedLinks;
    if (editingLink !== null) {
      // Update existing link
      updatedLinks = [...links];
      updatedLinks[editingLink] = {
        id: links[editingLink].id || Date.now().toString(),
        title: linkForm.title,
        url: linkForm.url,
        iconUrl: linkForm.iconUrl || '',
        order: links[editingLink].order || editingLink,
      };
    } else {
      // Add new link
      updatedLinks = [
        ...links,
        {
          id: Date.now().toString(),
          title: linkForm.title,
          url: linkForm.url,
          iconUrl: linkForm.iconUrl || '',
          order: links.length,
        }
      ];
    }

    // Save to database immediately
    const result = await updateLinks(updatedLinks);
    if (result.success) {
      setLinks(updatedLinks);
      setEditingLink(null);
      setLinkForm({ title: '', url: '', iconUrl: '' });
      setMessage({ type: 'success', text: editingLink !== null ? 'Link updated successfully!' : 'Link added successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to save link' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Save profile (links are already saved when added/edited/deleted)
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handlePhotoUpload(files);
    }
  };

  const handlePhotoUpload = async (files) => {
    setUploading(true);
    setUploadMessage({ type: '', text: '' });

    try {
      console.log('Starting photo upload with files:', files);
      
      if (!files || files.length === 0) {
        setUploadMessage({ type: 'error', text: 'Файли не вибрані' });
        setUploading(false);
        return;
      }

      // Check maximum photos limit (10)
      const currentPhotoCount = user?.profilePhotos?.length || 0;
      const maxPhotos = 10;
      const availableSlots = maxPhotos - currentPhotoCount;
      
      if (availableSlots <= 0) {
        setUploadMessage({ 
          type: 'error', 
          text: `Досягнуто максимальну кількість фото (${maxPhotos}). Видаліть фото, щоб додати нові.` 
        });
        setUploading(false);
        return;
      }

      if (files.length > availableSlots) {
        setUploadMessage({ 
          type: 'warning', 
          text: `Можна завантажити ще ${availableSlots} фото. Буде завантажено тільки ${availableSlots} з ${files.length} вибраних.` 
        });
      }
      
      // Validate file types and sizes
      const validationErrors = [];
      const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
        
        console.log(`File ${file.name}: type=${file.type}, size=${file.size}, validType=${isValidType}, validSize=${isValidSize}`);
        
        if (!isValidType) {
          validationErrors.push(`${file.name}: Дозволені тільки зображення`);
          return false;
        }
        
        if (!isValidSize) {
          validationErrors.push(`${file.name}: Розмір файлу має бути менше 5MB`);
          return false;
        }
        
        return true;
      });

      console.log('Valid files:', validFiles);

      if (validFiles.length === 0) {
        setUploadMessage({ 
          type: 'error', 
          text: validationErrors.length > 0 
            ? validationErrors.join('; ') 
            : 'Немає валідних файлів для завантаження' 
        });
        setUploading(false);
        return;
      }

      // Limit files to available slots
      const filesToUpload = validFiles.slice(0, availableSlots);
      
      if (validFiles.length > availableSlots) {
        console.warn(`Limiting upload to ${availableSlots} files (max photos: ${maxPhotos})`);
      }

      if (validationErrors.length > 0) {
        console.warn('Some files were invalid:', validationErrors);
      }

      console.log('Calling uploadProfilePhotos...');
      const result = await uploadProfilePhotos(filesToUpload);
      console.log('Upload result:', result);
      
      if (result.success) {
        const uploadedCount = filesToUpload.length;
        const successMessage = result.warning 
          ? `✅ Успішно завантажено ${uploadedCount} фото! ${result.warning}`
          : `✅ Успішно завантажено ${uploadedCount} ${uploadedCount === 1 ? 'фото' : uploadedCount < 5 ? 'фото' : 'фото'}!`;
        
        setUploadMessage({ 
          type: result.warning ? 'warning' : 'success', 
          text: successMessage 
        });
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // User state will be automatically updated by AuthContext
        // The component will re-render when user.profilePhotos changes
      } else {
        setUploadMessage({ 
          type: 'error', 
          text: result.error || 'Помилка завантаження фото. Перевірте консоль для деталей.' 
        });
      }
    } catch (error) {
      console.error('Upload error in component:', error);
      setUploadMessage({ 
        type: 'error', 
        text: `An error occurred while uploading photos: ${error.message || 'Unknown error'}` 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const result = await deleteProfilePhoto(photoId);
      if (result.success) {
        setUploadMessage({ type: 'success', text: 'Photo deleted successfully!' });
      } else {
        setUploadMessage({ type: 'error', text: result.error || 'Failed to delete photo' });
      }
    } catch (error) {
      setUploadMessage({ type: 'error', text: 'An error occurred while deleting photo' });
    }
  };

  const handleSetMainPhoto = async (photoId) => {
    try {
      const result = await setMainPhoto(photoId);
      if (result.success) {
        setUploadMessage({ type: 'success', text: 'Main photo updated successfully!' });
      } else {
        setUploadMessage({ type: 'error', text: result.error || 'Failed to set main photo' });
      }
    } catch (error) {
      setUploadMessage({ type: 'error', text: 'An error occurred while setting main photo' });
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleTimeSlotToggle = (timeSlot) => {
    const dateKey = getDateKey(selectedDate);
    setSelectedTimeSlots(prev => {
      const daySlots = prev[dateKey] || [];
      const isSelected = daySlots.includes(timeSlot);
      
      if (isSelected) {
        return {
          ...prev,
          [dateKey]: daySlots.filter(slot => slot !== timeSlot)
        };
      } else {
        return {
          ...prev,
          [dateKey]: [...daySlots, timeSlot]
        };
      }
    });
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleDayFocus = (dayKey) => {
    setFocusedDay(dayKey);
    setShowCalendar(true);
  };

  const handleDayBlur = () => {
    // Don't close calendar on blur - let click outside handler manage it
    // This prevents the calendar from closing when clicking inside it
  };

  const saveDayAvailability = () => {
    if (focusedDay && selectedTimeSlots[getDateKey(selectedDate)]) {
      const slots = selectedTimeSlots[getDateKey(selectedDate)];
      const timeString = slots.length > 0 ? slots.join(', ') : '';
      
      setFormData(prev => ({
        ...prev,
        weeklyAvailability: {
          ...prev.weeklyAvailability,
          [focusedDay]: timeString
        }
      }));
    }
    setShowCalendar(false);
    setFocusedDay(null);
  };

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" }
  ];

  return (
    <div className="section profile_sec">
      <div className="content_wrapper content_align_center">
        <div className="spacing_48" />
        
        {message.text && (
          <div className={`message ${message.type}`} style={{
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-form" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Basic Information */}
          <div className="form-section">
            <h4 className="section_title">Basic Information</h4>
            <div className="spacing_16" />
            
            <div className="w-layout-grid grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label htmlFor="name">Full Name</label>
                <input
                  className="w-input"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="username">Username</label>
                <input
                  className="w-input"
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="spacing_16" />
            <label htmlFor="bio">Bio</label>
            <textarea
              className="w-input"
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows="4"
            />
          </div>

          <div className="spacing_32" />
          <div className="line_divider" />
          <div className="spacing_32" />

          {/* Professional Information */}
          <div className="form-section">
            <h4 className="section_title">Professional Information</h4>
            <div className="spacing_16" />
            
            <div className="w-layout-grid grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label htmlFor="industry">Industry</label>
                <select
                  className="w-input"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                >
                  <option value="">Select Industry</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status">Status</label>
                <select
                  className="w-input"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="">Select Status</option>
                  <option value="Professional">Professional</option>
                  <option value="Amateur">Amateur</option>
                  <option value="Student">Student</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            <div className="spacing_16" />
            <label htmlFor="availableFor">Available For</label>
            <input
              className="w-input"
              type="text"
              id="availableFor"
              name="availableFor"
              value={formData.availableFor}
              onChange={handleInputChange}
              placeholder="e.g., Beauty, Editorial, Glamour, Print"
            />
          </div>

          <div className="spacing_32" />
          <div className="line_divider" />
          <div className="spacing_32" />

          {/* Personal Details */}
          <div className="form-section">
            <h4 className="section_title">Personal Details</h4>
            <div className="spacing_16" />
            
            <div className="w-layout-grid grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label htmlFor="age">Age</label>
                <input
                  className="w-input"
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Age"
                />
              </div>
              
              <div>
                <label htmlFor="gender">Gender</label>
                <select
                  className="w-input"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="currentCity">Current City</label>
                <input
                  className="w-input"
                  type="text"
                  id="currentCity"
                  name="currentCity"
                  value={formData.currentCity}
                  onChange={handleInputChange}
                  placeholder="e.g., Miami, USA"
                />
              </div>
            </div>

            <div className="spacing_16" />
            <label htmlFor="markets">Markets</label>
            <input
              className="w-input"
              type="text"
              id="markets"
              name="markets"
              value={formData.markets}
              onChange={handleInputChange}
              placeholder="e.g., Miami, Los Angeles, New York"
            />
          </div>

          <div className="spacing_32" />
          <div className="line_divider" />
          <div className="spacing_32" />

          {/* Measurements */}
          <div className="form-section">
            <h4 className="section_title">Measurements</h4>
            <div className="spacing_16" />
            
            <div className="w-layout-grid grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label htmlFor="height">Height</label>
                <input
                  className="w-input"
                  type="text"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="e.g., 5'11\"
                />
              </div>
              
              <div>
                <label htmlFor="weight">Weight</label>
                <input
                  className="w-input"
                  type="text"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 135 lbs"
                />
              </div>

              <div>
                <label htmlFor="shoe">Shoe Size</label>
                <input
                  className="w-input"
                  type="text"
                  id="shoe"
                  name="shoe"
                  value={formData.shoe}
                  onChange={handleInputChange}
                  placeholder="e.g., 7 US"
                />
              </div>
            </div>

            <div className="spacing_16" />
            <div className="w-layout-grid grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label htmlFor="bust">Bust</label>
                <input
                  className="w-input"
                  type="text"
                  id="bust"
                  name="bust"
                  value={formData.bust}
                  onChange={handleInputChange}
                  placeholder="e.g., 34B"
                />
              </div>
              
              <div>
                <label htmlFor="waist">Waist</label>
                <input
                  className="w-input"
                  type="text"
                  id="waist"
                  name="waist"
                  value={formData.waist}
                  onChange={handleInputChange}
                  placeholder="e.g., 26"
                />
              </div>

              <div>
                <label htmlFor="hips">Hips</label>
                <input
                  className="w-input"
                  type="text"
                  id="hips"
                  name="hips"
                  value={formData.hips}
                  onChange={handleInputChange}
                  placeholder="e.g., 36"
                />
              </div>
            </div>
          </div>

          <div className="spacing_32" />
          <div className="line_divider" />
          <div className="spacing_32" />

          {/* Weekly Availability */}
          <div className="form-section">
            <h4 className="section_title">Weekly Availability</h4>
            <div className="spacing_16" />
            <p className="text_color_grey">Click on any day input to open calendar and select specific dates and times</p>
            <div className="spacing_16" />
            
            <div className="w-layout-grid grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '15px', position: 'relative' }}>
              {days.map((day) => (
                <div key={day.key} style={{ position: 'relative' }}>
                  <label htmlFor={day.key}>{day.label}</label>
                  <input
                    className="w-input"
                    type="text"
                    id={day.key}
                    value={formData.weeklyAvailability[day.key]}
                    onChange={(e) => handleAvailabilityChange(day.key, e.target.value)}
                    onFocus={() => handleDayFocus(day.key)}
                    onBlur={handleDayBlur}
                    placeholder="Click to select dates"
                    readOnly
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Calendar Popup */}
                  {showCalendar && focusedDay === day.key && (
                    <div 
                      data-calendar-popup
                      onMouseDown={(e) => e.preventDefault()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        zIndex: 1000,
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        padding: '20px',
                        minWidth: '400px',
                        maxWidth: '500px'
                      }}>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        {/* Calendar */}
                        <div style={{ flex: '1' }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '15px'
                          }}>
                            <button
                              onClick={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setMonth(newDate.getMonth() - 1);
                                setSelectedDate(newDate);
                              }}
                              style={{
                                background: '#783FF3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ←
                            </button>
                            <h4 style={{ margin: 0, fontSize: '14px' }}>
                              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h4>
                            <button
                              onClick={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setMonth(newDate.getMonth() + 1);
                                setSelectedDate(newDate);
                              }}
                              style={{
                                background: '#783FF3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              →
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                              <div key={dayName} style={{ 
                                padding: '6px', 
                                textAlign: 'center', 
                                fontWeight: 'bold',
                                backgroundColor: '#f8f9fa',
                                fontSize: '10px'
                              }}>
                                {dayName}
                              </div>
                            ))}
                            
                            {getDaysInMonth(selectedDate).map((date, index) => {
                              if (!date) {
                                return <div key={index} style={{ padding: '6px' }}></div>;
                              }
                              
                              const isToday = date.toDateString() === new Date().toDateString();
                              const isSelected = date.toDateString() === selectedDate.toDateString();
                              const hasTimeSlots = selectedTimeSlots[getDateKey(date)]?.length > 0;
                              
                              return (
                                <button
                                  key={date.toISOString()}
                                  onClick={() => handleDateSelect(date)}
                                  style={{
                                    padding: '6px',
                                    border: '1px solid #ddd',
                                    backgroundColor: isSelected ? '#783FF3' : 
                                                   hasTimeSlots ? '#e8f5e8' : 
                                                   isToday ? '#fff3cd' : '#fff',
                                    color: isSelected ? 'white' : '#333',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: isToday ? 'bold' : 'normal'
                                  }}
                                >
                                  {date.getDate()}
                                  {hasTimeSlots && !isSelected && (
                                    <div style={{ 
                                      fontSize: '6px', 
                                      color: '#28a745',
                                      marginTop: '1px'
                                    }}>
                                      ●
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Time Slots */}
                        <div style={{ flex: '1' }}>
                          <h5 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>
                            Times for {formatDate(selectedDate)}
                          </h5>
                          
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: '4px',
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            {timeSlots.map(timeSlot => {
                              const dateKey = getDateKey(selectedDate);
                              const isSelected = selectedTimeSlots[dateKey]?.includes(timeSlot) || false;
                              
                              return (
                                <button
                                  key={timeSlot}
                                  onClick={() => handleTimeSlotToggle(timeSlot)}
                                  style={{
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    backgroundColor: isSelected ? '#783FF3' : '#fff',
                                    color: isSelected ? 'white' : '#333',
                                    cursor: 'pointer',
                                    borderRadius: '3px',
                                    fontSize: '10px'
                                  }}
                                >
                                  {timeSlot}
                                </button>
                              );
                            })}
                          </div>
                          
                          <div style={{ marginTop: '10px' }}>
                            <button
                              onClick={saveDayAvailability}
                              style={{
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                marginRight: '8px'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setShowCalendar(false);
                                setFocusedDay(null);
                              }}
                              style={{
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '11px'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="spacing_32" />
          <div className="line_divider" />
          <div className="spacing_32" />

          {/* Social Links */}
          <div className="form-section">
            <h4 className="section_title">Social Links</h4>
            <div className="spacing_16" />
            
            <div className="w-layout-grid grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label htmlFor="instagram">Instagram</label>
                <input
                  className="w-input"
                  type="url"
                  id="instagram"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>
              
              <div>
                <label htmlFor="twitter">Twitter</label>
                <input
                  className="w-input"
                  type="url"
                  id="twitter"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>

            <div className="spacing_16" />
            <div className="w-layout-grid grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                  className="w-input"
                  type="url"
                  id="linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              
              <div>
                <label htmlFor="onlyfans">OnlyFans</label>
                <input
                  className="w-input"
                  type="url"
                  id="onlyfans"
                  value={formData.socialLinks.onlyfans}
                  onChange={(e) => handleSocialLinkChange('onlyfans', e.target.value)}
                  placeholder="https://onlyfans.com/username"
                />
              </div>
            </div>

            <div className="spacing_16" />
            <div className="w-layout-grid grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label htmlFor="spotify">Spotify</label>
                <input
                  className="w-input"
                  type="url"
                  id="spotify"
                  value={formData.socialLinks.spotify}
                  onChange={(e) => handleSocialLinkChange('spotify', e.target.value)}
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>
              
              <div>
                <label htmlFor="vimeo">Vimeo</label>
                <input
                  className="w-input"
                  type="url"
                  id="vimeo"
                  value={formData.socialLinks.vimeo}
                  onChange={(e) => handleSocialLinkChange('vimeo', e.target.value)}
                  placeholder="https://vimeo.com/username"
                />
              </div>
            </div>

            <div className="spacing_16" />
            <div>
              <label htmlFor="cashapp">Cash App</label>
              <input
                className="w-input"
                type="text"
                id="cashapp"
                value={formData.socialLinks.cashapp}
                onChange={(e) => handleSocialLinkChange('cashapp', e.target.value)}
                placeholder="$username"
              />
            </div>
          </div>

          <div className="spacing_32" />
          <div className="line_divider" />
          <div className="spacing_32" />

          {/* Custom Links Section */}
          <div className="form-section">
            <h4 className="section_title">My Links</h4>
            <div className="spacing_16" />
            <p className="text_color_grey">Добавьте ссылки, которые будут отображаться на вашей странице профиля</p>
            <div className="spacing_16" />

            {/* Link Form */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h5 style={{ marginTop: 0, marginBottom: '15px' }}>
                {editingLink !== null ? 'Редактировать ссылку' : 'Добавить новую ссылку'}
              </h5>
              
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="linkTitle" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Название *
                </label>
                <input
                  type="text"
                  id="linkTitle"
                  name="title"
                  value={linkForm.title}
                  onChange={handleLinkFormChange}
                  placeholder="Например: My Exclusive Content"
                  className="w-input"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="linkUrl" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  URL *
                </label>
                <input
                  type="url"
                  id="linkUrl"
                  name="url"
                  value={linkForm.url}
                  onChange={handleLinkFormChange}
                  placeholder="https://example.com"
                  className="w-input"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="linkIconUrl" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  URL иконки (опционально)
                </label>
                <input
                  type="url"
                  id="linkIconUrl"
                  name="iconUrl"
                  value={linkForm.iconUrl}
                  onChange={handleLinkFormChange}
                  placeholder="/images/onlyfans-logo-15222.png"
                  className="w-input"
                />
                <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  Можно использовать относительный путь: /images/onlyfans-logo-15222.png
                </small>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSaveLink}
                  className="button accent_button w-button"
                  style={{
                    background: '#783FF3',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {editingLink !== null ? 'Сохранить изменения' : 'Добавить ссылку'}
                </button>
                {editingLink !== null && (
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="button w-button"
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    Отмена редактирования
                  </button>
                )}
              </div>
            </div>

            {/* Existing Links List */}
            <div>
              <h5 style={{ marginBottom: '15px' }}>Ваши ссылки ({links.length})</h5>
              {links.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  Пока нет ссылок. Добавьте первую ссылку выше.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {links.map((link, index) => (
                    <div
                      key={link.id || index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px',
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{link.title}</div>
                        <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                          {link.url}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleEditLink(link, index)}
                          style={{
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✏️ Редактировать
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(index)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🗑️ Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="spacing_48" />
          
          {/* Submit Button */}
          <button
            type="submit"
            className="button bookme_large w-button"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        <div className="spacing_32" />
        
        {/* Photo Upload Section */}
        <div className="form-section">
          <h4 className="section_title">Profile Photos</h4>
          <div className="spacing_16" />
          
          <p className="text_color_grey" style={{ marginBottom: '20px', fontSize: '14px' }}>
            Завантажте від 1 до 10 фото для вашого профілю. Перше фото стане головним автоматично.
            {user?.profilePhotos && user.profilePhotos.length > 0 && (
              <span style={{ display: 'block', marginTop: '8px', fontWeight: 'bold', color: '#783FF3' }}>
                Завантажено: {user.profilePhotos.length} / 10 фото
              </span>
            )}
          </p>
          
          {uploadMessage.text && (
            <div className={`message ${uploadMessage.type}`} style={{
              padding: '16px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: uploadMessage.type === 'success' ? '#d4edda' : 
                             uploadMessage.type === 'warning' ? '#fff3cd' : '#f8d7da',
              color: uploadMessage.type === 'success' ? '#155724' : 
                    uploadMessage.type === 'warning' ? '#856404' : '#721c24',
              border: `1px solid ${uploadMessage.type === 'success' ? '#c3e6cb' : 
                              uploadMessage.type === 'warning' ? '#ffeaa7' : '#f5c6cb'}`,
              whiteSpace: 'pre-line',
              lineHeight: '1.6',
              fontSize: '14px',
              maxWidth: '100%',
              wordWrap: 'break-word'
            }}>
              {uploadMessage.text}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex_wrapper flex_center" style={{ marginBottom: '20px', flexDirection: 'column', gap: '10px' }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="button accent_button w-button"
              style={{ 
                background: '#783FF3', 
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                opacity: uploading ? 0.7 : 1,
                minWidth: '200px'
              }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || (user?.profilePhotos && user.profilePhotos.length >= 10)}
            >
              {uploading ? '⏳ Завантаження...' : 
               (user?.profilePhotos && user.profilePhotos.length >= 10) ? '✅ Досягнуто ліміт (10 фото)' :
               '📸 Завантажити фото (1-10 шт)'}
            </button>
            {user?.profilePhotos && user.profilePhotos.length >= 10 && (
              <p style={{ fontSize: '12px', color: '#6c757d', margin: 0 }}>
                Ви досягли максимальної кількості фото. Видаліть фото, щоб додати нові.
              </p>
            )}
          </div>

          {/* Photo Gallery */}
          {user?.profilePhotos && user.profilePhotos.length > 0 && (
            <div className="photo-gallery" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '15px',
              marginTop: '20px'
            }}>
              {user.profilePhotos.map((photo, index) => (
                <div key={photo.id || index} className="photo-item" style={{
                  position: 'relative',
                  border: photo.isMain ? '3px solid #783FF3' : '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f8f9fa'
                }}>
                  <img
                    src={photo.url}
                    alt={`Profile photo ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{
                    display: 'none',
                    width: '100%',
                    height: '200px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    color: '#6c757d'
                  }}>
                    📷 Image not found
                  </div>
                  
                  {/* Photo Actions */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '5px'
                  }}>
                    {!photo.isMain && (
                      <button
                        onClick={() => handleSetMainPhoto(photo.id)}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        title="Set as main photo"
                      >
                        ⭐
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      title="Delete photo"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  {/* Main Photo Badge */}
                  {photo.isMain && (
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      background: '#783FF3',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      MAIN
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {(!user?.profilePhotos || user.profilePhotos.length === 0) && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6c757d',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
              <p>No photos uploaded yet</p>
              <p style={{ fontSize: '14px', marginTop: '5px' }}>Click the upload button above to add your profile photos</p>
            </div>
          )}
        </div>
        
        <div className="spacing_48" />
      </div>
    </div>
  );
}

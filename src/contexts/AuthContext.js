import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseAuth } from '../services/supabase';
import supabase from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Load portfolio albums from database for a specific user
  const loadPortfolioAlbumsForUser = async (userId) => {
    try {
      const { data: albums, error } = await supabase
        .from('portfolio_albums')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading portfolio albums:', error);
        return;
      }

      // Format albums for frontend
      const formattedAlbums = (albums || []).map(album => {
        const formatted = {
          id: album.id,
          title: album.title,
          description: album.description,
          tag: album.tag || 'Portfolio', // Ensure tag always has a value
          imageUrl: album.image_url,
          uploadedAt: album.created_at,
        };
        console.log('Loaded album tag:', formatted.tag, 'for album:', formatted.title); // Debug log
        return formatted;
      });

      // Update user state with portfolio albums
      setUser(prev => ({
        ...prev,
        portfolioAlbums: formattedAlbums,
      }));
    } catch (error) {
      console.error('Load portfolio albums error:', error);
    }
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabaseAuth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Load additional user profile data from user metadata
          const userMetadata = session.user.user_metadata || {};
          const userData = {
            ...session.user,
            firstName: userMetadata.firstName || '',
            lastName: userMetadata.lastName || '',
            phone: userMetadata.phone || '',
            userType: userMetadata.userType || 'model',
            profilePhotos: userMetadata.profilePhotos || [],
            links: userMetadata.links || [],
            portfolioAlbums: [], // Will be loaded from database
          };
          setUser(userData);
          
          // Load portfolio albums from database
          if (session.user.id) {
            loadPortfolioAlbumsForUser(session.user.id);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: authListener } = supabaseAuth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          setSession(session);
          const userMetadata = session.user.user_metadata || {};
          const userData = {
            ...session.user,
            firstName: userMetadata.firstName || '',
            lastName: userMetadata.lastName || '',
            phone: userMetadata.phone || '',
            userType: userMetadata.userType || 'model',
            profilePhotos: userMetadata.profilePhotos || [],
            links: userMetadata.links || [],
            portfolioAlbums: [], // Will be loaded from database
          };
          setUser(userData);
          setIsAuthenticated(true);
          
          // Load portfolio albums from database
          if (session.user.id) {
            loadPortfolioAlbumsForUser(session.user.id);
          }
        } else {
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    // Cleanup subscription
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials) => {
    try {
      // Validate required fields
      if (!credentials?.email || !credentials?.password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      const { data, error } = await supabaseAuth.signIn(
        credentials.email,
        credentials.password
      );

      if (error) {
        console.error('Login error:', error);
        
        // Provide more detailed error messages
        let errorMessage = error.message || 'Login failed';
        
        if (error.message) {
          const errorLower = error.message.toLowerCase();
          
          // Handle specific Supabase error codes
          if (errorLower.includes('invalid login credentials') ||
              errorLower.includes('invalid credentials') ||
              errorLower.includes('email not confirmed') ||
              error.status === 400) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          } else if (errorLower.includes('email not confirmed') ||
                     errorLower.includes('not confirmed')) {
            errorMessage = 'Please verify your email address before signing in. Check your inbox for a confirmation email.';
          } else if (errorLower.includes('too many requests') ||
                     errorLower.includes('rate limit')) {
            errorMessage = 'Too many login attempts. Please wait a moment and try again.';
          } else if (errorLower.includes('user not found')) {
            errorMessage = 'No account found with this email address. Please sign up first.';
          }
        }
        
        return { success: false, error: errorMessage };
      }

      if (data?.user) {
        const userMetadata = data.user.user_metadata || {};
        const userData = {
          ...data.user,
          firstName: userMetadata.firstName || '',
          lastName: userMetadata.lastName || '',
          phone: userMetadata.phone || '',
          userType: userMetadata.userType || 'model',
          profilePhotos: userMetadata.profilePhotos || [],
          links: userMetadata.links || [],
          portfolioAlbums: [], // Will be loaded from database
        };
        setUser(userData);
        setSession(data.session);
        setIsAuthenticated(true);
        
        // Load portfolio albums from database
        if (data.user.id) {
          loadPortfolioAlbumsForUser(data.user.id);
        }
        
        return { success: true };
      }

      return { success: false, error: 'Login failed - no user data returned' };
    } catch (error) {
      console.error('Login exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred during login' };
    }
  };

  const register = async (userData) => {
    try {
      const { email, password, firstName, lastName, phone, userType } = userData;

      // Validate required fields
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Validate password length (Supabase minimum is 6 characters)
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      // Prepare metadata object
      const metadata = {};
      if (firstName) metadata.firstName = firstName;
      if (lastName) metadata.lastName = lastName;
      if (phone) metadata.phone = phone;
      if (userType) metadata.userType = userType;
      metadata.profilePhotos = [];
      metadata.links = [];

      // Sign up with Supabase
      const { data, error } = await supabaseAuth.signUp(email, password, metadata);

      if (error) {
        console.error('Supabase signup error:', error);
        
        // Provide more detailed error messages
        let errorMessage = error.message || 'Registration failed';
        
        if (error.message) {
          // Handle specific Supabase error codes
          if (error.message.includes('User already registered') || 
              error.message.includes('already registered') ||
              error.status === 422) {
            errorMessage = 'This email is already registered. Please sign in instead.';
          } else if (error.message.includes('Password')) {
            errorMessage = 'Password does not meet requirements. Please use at least 6 characters.';
          } else if (error.message.includes('Email')) {
            errorMessage = 'Invalid email address. Please check and try again.';
          }
        }
        
        return { success: false, error: errorMessage };
      }

      // Check if user was created (even if email confirmation is required)
      if (data?.user) {
        const userMetadata = data.user.user_metadata || {};
        setUser({
          ...data.user,
          firstName: userMetadata.firstName || firstName || '',
          lastName: userMetadata.lastName || lastName || '',
          phone: userMetadata.phone || phone || '',
          userType: userMetadata.userType || userType || 'model',
          profilePhotos: userMetadata.profilePhotos || [],
          links: userMetadata.links || [],
        });
        
        // Session might be null if email confirmation is required
        if (data.session) {
          setSession(data.session);
          setIsAuthenticated(true);
        }
        
        return { success: true, requiresConfirmation: !data.session };
      }

      return { success: false, error: 'Registration failed - no user data returned' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabaseAuth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Get current user metadata
      const currentMetadata = user?.user_metadata || {};
      
      // Merge with new profile data
      const updatedMetadata = {
        ...currentMetadata,
        ...profileData,
      };

      // Update user in Supabase
      const { data, error } = await supabaseAuth.updateUser({
        data: updatedMetadata,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        const userMetadata = data.user.user_metadata || {};
        setUser({
          ...data.user,
          firstName: userMetadata.firstName || '',
          lastName: userMetadata.lastName || '',
          phone: userMetadata.phone || '',
          userType: userMetadata.userType || 'model',
          profilePhotos: userMetadata.profilePhotos || [],
          links: userMetadata.links || [],
          portfolioAlbums: userMetadata.portfolioAlbums || [],
        });
        return { success: true, data: data.user };
      }

      return { success: false, error: 'Profile update failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const uploadProfilePhotos = async (files) => {
    try {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      if (!files || files.length === 0) {
        return { success: false, error: 'No files provided' };
      }

      // Try to check if bucket exists, but don't fail if we can't check
      // We'll attempt upload anyway and get a more specific error if bucket doesn't exist
      let bucketExists = false;
      
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (!bucketError && buckets) {
          bucketExists = buckets.some(bucket => bucket.name === 'profile-photos');
          console.log('Bucket check:', bucketExists ? 'Found' : 'Not found', 'profile-photos');
        } else if (bucketError) {
          console.warn('Could not check bucket existence (this is OK, will try upload anyway):', bucketError.message);
          // Don't fail here - we'll try upload and get better error message
        }
      } catch (checkError) {
        console.warn('Could not check bucket existence (this is OK, will try upload anyway):', checkError);
        // Continue anyway - we'll catch the error during upload
      }
      
      // Only return early if we confirmed bucket doesn't exist AND we didn't have an error checking
      // If we can't check, we'll try upload and get a better error message

      const uploadedUrls = [];
      const errors = [];

      // Upload each file to Supabase Storage
      for (const file of files) {
        try {
          const fileExt = file.name.split('.').pop();
          const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
          const fileName = `${user.id}/${uniqueId}.${fileExt}`;
          
          console.log('Uploading file:', file.name, 'to:', fileName);
          
          console.log('Attempting to upload to bucket "profile-photos" with file:', fileName);
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Upload error details:', {
              message: uploadError.message,
              error: uploadError.error,
              statusCode: uploadError.statusCode,
              status: uploadError.status,
              fullError: uploadError
            });
            
            // Extract error message from different possible formats
            // Supabase errors can come in various formats: { message: '...' }, { error: '...' }, { statusCode: 403, message: '...' }
            let errorMsg = '';
            let statusCode = null;
            
            if (typeof uploadError === 'string') {
              errorMsg = uploadError;
            } else if (uploadError.message) {
              errorMsg = uploadError.message;
            } else if (uploadError.error) {
              errorMsg = typeof uploadError.error === 'string' ? uploadError.error : uploadError.error.message || JSON.stringify(uploadError.error);
            } else {
              errorMsg = JSON.stringify(uploadError);
            }
            
            statusCode = uploadError.statusCode || uploadError.status || (uploadError.error && uploadError.error.statusCode) || null;
            
            // Provide helpful error messages for common issues
            let errorMessage = errorMsg;
            
            if (errorMsg.includes('Bucket not found') || (errorMsg.includes('bucket') && errorMsg.includes('not found'))) {
              errorMessage = `STORAGE BUCKET NOT FOUND\n\nTo fix this:\n1. Go to https://app.supabase.com\n2. Select your project\n3. Click "Storage" in the left sidebar\n4. Click "Create a new bucket"\n5. Name: "profile-photos" (exactly)\n6. Enable "Public bucket"\n7. Click "Create bucket"\n8. Add storage policies (see below)\n\nAfter creating the bucket, try uploading again.`;
            } else if (errorMsg.includes('new row violates row-level security') || 
                      errorMsg.includes('row-level security') || 
                      errorMsg.includes('row level security') ||
                      errorMsg.includes('Unauthorized') ||
                      statusCode === 403) {
              errorMessage = `STORAGE POLICY ERROR (403 Unauthorized)\n\nYour bucket exists but storage policies are missing or incorrect.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚡ ШВИДКИЙ СПОСІБ (рекомендовано):\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n1. Go to https://app.supabase.com → ваш проект\n2. Click "SQL Editor" (ліва панель)\n3. Click "New query"\n4. Вставте весь цей SQL і натисніть "Run":\n\nCREATE POLICY "Allow authenticated users to upload profile photos"\nON storage.objects FOR INSERT TO authenticated\nWITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);\n\nCREATE POLICY "Allow public access to profile photos"\nON storage.objects FOR SELECT TO public\nUSING (bucket_id = 'profile-photos');\n\nCREATE POLICY "Allow users to delete their own profile photos"\nON storage.objects FOR DELETE TO authenticated\nUSING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);\n\n5. Перевірте, що всі 3 policies створилися успішно\n6. Спробуйте завантажити фото знову\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nАБО через UI (якщо SQL не працює):\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nStorage → profile-photos → Policies → New Policy\n\nPOLICY 1 (INSERT):\n- Name: Allow authenticated users to upload profile photos\n- Operation: INSERT\n- Roles: authenticated\n- WITH CHECK expression (тільки цей текст!):\nbucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]\n\nPOLICY 2 (SELECT):\n- Name: Allow public access to profile photos\n- Operation: SELECT\n- Roles: public\n- USING expression (тільки цей текст!):\nbucket_id = 'profile-photos'\n\nPOLICY 3 (DELETE):\n- Name: Allow users to delete their own profile photos\n- Operation: DELETE\n- Roles: authenticated\n- USING expression (тільки цей текст!):\nbucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]\n\nДетальні інструкції: див. STORAGE_POLICIES_FIX.md`;
            } else if (errorMsg.includes('The resource already exists') || errorMsg.includes('already exists')) {
              errorMessage = `File "${file.name}" already exists. Please try again with a different file.`;
            } else if (errorMsg.includes('JWT') || errorMsg.includes('token') || errorMsg.includes('unauthorized')) {
              errorMessage = `Authentication error. Please log out and log back in, then try again.`;
            } else if (statusCode === 401) {
              errorMessage = `Unauthorized (401). Please log out and log back in, then try again.`;
            }
            
            errors.push(`Failed to upload ${file.name}: ${errorMessage}`);
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);

          console.log('File uploaded successfully, public URL:', publicUrl);

          uploadedUrls.push({
            id: fileName,
            url: publicUrl,
            uploadedAt: new Date().toISOString(),
            isMain: (user?.profilePhotos || []).length === 0 && uploadedUrls.length === 0, // First photo becomes main
          });
        } catch (fileError) {
          console.error('Error processing file:', fileError);
          errors.push(`Failed to process ${file.name}: ${fileError.message}`);
        }
      }

      if (uploadedUrls.length === 0) {
        return { 
          success: false, 
          error: errors.length > 0 ? errors.join('; ') : 'No files were uploaded successfully' 
        };
      }

      // Update user metadata with new photo URLs
      const currentPhotos = user?.profilePhotos || [];
      const updatedPhotos = [...currentPhotos, ...uploadedUrls];

      console.log('Updating profile with photos. Current:', currentPhotos.length, 'New:', uploadedUrls.length, 'Total:', updatedPhotos.length);

      const updateResult = await updateProfile({
        profilePhotos: updatedPhotos,
      });

      if (updateResult.success) {
        // updateProfile already updates the user state, so we don't need to refresh
        // The component will automatically re-render when user.profilePhotos changes
        
        return { 
          success: true, 
          data: uploadedUrls,
          warning: errors.length > 0 ? `Some files failed: ${errors.join('; ')}` : undefined
        };
      }

      return { success: false, error: 'Failed to update profile with photos' };
    } catch (error) {
      console.error('Upload photos error:', error);
      return { success: false, error: error.message || 'An error occurred while uploading photos' };
    }
  };

  const deleteProfilePhoto = async (photoId) => {
    try {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([photoId]);

      if (error) {
        console.error('Error deleting file:', error);
      }

      // Update user metadata to remove photo
      const currentPhotos = user?.profilePhotos || [];
      const updatedPhotos = currentPhotos.filter(photo => photo.id !== photoId);

      const updateResult = await updateProfile({
        profilePhotos: updatedPhotos,
      });

      if (updateResult.success) {
        return { success: true };
      }

      return { success: false, error: 'Failed to update profile after deletion' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const setMainPhoto = async (photoId) => {
    try {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      // Update user metadata to set main photo
      const currentPhotos = user?.profilePhotos || [];
      const updatedPhotos = currentPhotos.map(photo => ({
        ...photo,
        isMain: photo.id === photoId,
      }));

      const updateResult = await updateProfile({
        profilePhotos: updatedPhotos,
      });

      if (updateResult.success) {
        return { success: true };
      }

      return { success: false, error: 'Failed to set main photo' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabaseAuth.resetPasswordForEmail(email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const { data, error } = await supabaseAuth.updatePassword(newPassword);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateLinks = async (links) => {
    try {
      const result = await updateProfile({ links });
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const uploadPortfolioAlbum = async (albumData) => {
    try {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      const { imageFile, title, description, tag } = albumData;

      if (!imageFile) {
        return { success: false, error: 'Image file is required' };
      }

      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const fileName = `${user.id}/portfolio/${uniqueId}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: uploadError.message || 'Failed to upload image' };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Insert album into Supabase database table
      const albumPayload = {
        user_id: user.id,
        title: title || 'Untitled Album',
        description: description || '',
        tag: tag || 'Portfolio',
        image_url: publicUrl,
        display_order: 0
      };
      
      console.log('Saving album with tag:', albumPayload.tag); // Debug log
      
      const { data: insertedAlbum, error: dbError } = await supabase
        .from('portfolio_albums')
        .insert(albumPayload)
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Try to delete uploaded file if database insert failed
        await supabase.storage.from('profile-photos').remove([fileName]);
        return { success: false, error: dbError.message || 'Failed to save album to database' };
      }

      // Format album for frontend
      const newAlbum = {
        id: insertedAlbum.id,
        title: insertedAlbum.title,
        description: insertedAlbum.description,
        tag: insertedAlbum.tag,
        imageUrl: insertedAlbum.image_url,
        uploadedAt: insertedAlbum.created_at,
      };

      // Refresh user's portfolio albums
      await loadPortfolioAlbumsForUser(user.id);

      return { success: true, data: newAlbum };
    } catch (error) {
      console.error('Upload portfolio album error:', error);
      return { success: false, error: error.message || 'An error occurred while uploading album' };
    }
  };

  const updatePortfolioAlbum = async (albumId, albumData) => {
    try {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      const updatePayload = {};
      
      if (albumData.title !== undefined) updatePayload.title = albumData.title;
      if (albumData.description !== undefined) updatePayload.description = albumData.description;
      if (albumData.tag !== undefined) updatePayload.tag = albumData.tag;

      // If new image file provided, upload it first
      if (albumData.imageFile) {
        const fileExt = albumData.imageFile.name.split('.').pop();
        const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
        const fileName = `${user.id}/portfolio/${uniqueId}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, albumData.imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          return { success: false, error: uploadError.message || 'Failed to upload image' };
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        updatePayload.image_url = publicUrl;
      }

      // Update album in database
      const { data, error } = await supabase
        .from('portfolio_albums')
        .update(updatePayload)
        .eq('id', albumId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        return { success: false, error: error.message || 'Failed to update album' };
      }

      // Refresh user's portfolio albums
      await loadPortfolioAlbumsForUser(user.id);

      return { success: true };
    } catch (error) {
      console.error('Update portfolio album error:', error);
      return { success: false, error: error.message || 'An error occurred while updating album' };
    }
  };

  const deletePortfolioAlbum = async (albumId) => {
    try {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get album data first to get image URL
      const { data: album, error: fetchError } = await supabase
        .from('portfolio_albums')
        .select('image_url')
        .eq('id', albumId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        return { success: false, error: 'Album not found' };
      }

      // Delete image from storage if exists
      if (album?.image_url) {
        // Extract file path from URL
        const urlParts = album.image_url.split('/');
        const fileName = urlParts.slice(-2).join('/'); // Get user_id/filename
        const { error: storageError } = await supabase.storage
          .from('profile-photos')
          .remove([fileName]);

        if (storageError) {
          console.error('Error deleting file:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete album from database
      const { error: deleteError } = await supabase
        .from('portfolio_albums')
        .delete()
        .eq('id', albumId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return { success: false, error: deleteError.message || 'Failed to delete album' };
      }

      // Refresh user's portfolio albums
      await loadPortfolioAlbumsForUser(user.id);

      return { success: true };
    } catch (error) {
      console.error('Delete portfolio album error:', error);
      return { success: false, error: error.message || 'An error occurred while deleting album' };
    }
  };

  const value = {
    user,
    session,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    uploadProfilePhotos,
    deleteProfilePhoto,
    setMainPhoto,
    resetPassword,
    changePassword,
    updateLinks,
    uploadPortfolioAlbum,
    updatePortfolioAlbum,
    deletePortfolioAlbum,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
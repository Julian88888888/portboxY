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
          setUser({
            ...session.user,
            firstName: userMetadata.firstName || '',
            lastName: userMetadata.lastName || '',
            phone: userMetadata.phone || '',
            userType: userMetadata.userType || 'model',
            profilePhotos: userMetadata.profilePhotos || [],
            links: userMetadata.links || [],
          });
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
          setUser({
            ...session.user,
            firstName: userMetadata.firstName || '',
            lastName: userMetadata.lastName || '',
            phone: userMetadata.phone || '',
            userType: userMetadata.userType || 'model',
            profilePhotos: userMetadata.profilePhotos || [],
            links: userMetadata.links || [],
          });
          setIsAuthenticated(true);
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
      const { data, error } = await supabaseAuth.signIn(
        credentials.email,
        credentials.password
      );

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
        });
        setSession(data.session);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const { email, password, firstName, lastName, phone, userType } = userData;

      // Sign up with Supabase
      const { data, error } = await supabaseAuth.signUp(email, password, {
        firstName,
        lastName,
        phone,
        userType,
        profilePhotos: [],
        links: [],
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        const userMetadata = data.user.user_metadata || {};
        setUser({
          ...data.user,
          firstName: userMetadata.firstName || firstName,
          lastName: userMetadata.lastName || lastName,
          phone: userMetadata.phone || phone,
          userType: userMetadata.userType || userType,
          profilePhotos: userMetadata.profilePhotos || [],
          links: userMetadata.links || [],
        });
        setSession(data.session);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message };
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
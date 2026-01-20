import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  getProfile,
  getProfileByUsername,
  upsertProfile,
  checkUsernameAvailability,
  uploadAvatar,
  uploadHeader,
  deleteAvatar,
  deleteHeader,
  getAvatarUrl,
  getHeaderUrl,
} from '../services/profileService';

/**
 * React Query hook to get current user's profile
 */
export const useProfile = () => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: isAuthenticated && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * React Query hook to get profile by username (public profile)
 */
export const useProfileByUsername = (username) => {
  return useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () => getProfileByUsername(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * React Query hook to update profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload) => {
      return await upsertProfile(payload);
    },
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    },
  });
};

/**
 * Hook to check username availability
 */
export const useCheckUsername = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (username) => {
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      return await checkUsernameAvailability(username, user.id);
    },
  });
};

/**
 * Hook to upload avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      return await uploadAvatar(file);
    },
    onSuccess: () => {
      // Invalidate profile to refetch with new avatar
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

/**
 * Hook to upload header
 */
export const useUploadHeader = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      return await uploadHeader(file);
    },
    onSuccess: () => {
      // Invalidate profile to refetch with new header
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

/**
 * Hook to delete avatar
 */
export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (path) => {
      return await deleteAvatar(path);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

/**
 * Hook to delete header
 */
export const useDeleteHeader = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (path) => {
      return await deleteHeader(path);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

/**
 * Helper hook to get profile image URL
 */
export const useProfileImageUrl = () => {
  const { data: profile } = useProfile();
  
  if (!profile?.profile_photo_path) {
    return '/images/headshot_model.jpg';
  }
  
  return getAvatarUrl(profile.profile_photo_path);
};

/**
 * Helper hook to get header image URL
 */
export const useHeaderImageUrl = () => {
  const { data: profile } = useProfile();
  
  if (!profile?.header_photo_path) {
    return null;
  }
  
  return getHeaderUrl(profile.header_photo_path);
};


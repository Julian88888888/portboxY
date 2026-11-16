import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadSummary } from '../services/bookingsService';

const EMPTY = { total: 0, incoming_total: 0, outgoing_total: 0, by_booking: {} };

export const BOOKING_UNREAD_QUERY_KEY = ['bookingUnread'];

/**
 * Polls unread booking chat counts every 3 minutes.
 */
export const useBookingUnread = () => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: BOOKING_UNREAD_QUERY_KEY,
    queryFn: async () => {
      const result = await getUnreadSummary();
      if (!result.success) {
        return result.data || EMPTY;
      }
      return result.data || EMPTY;
    },
    enabled: isAuthenticated && !!user,
    refetchInterval: 3 * 60 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });
};

export const useInvalidateBookingUnread = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: BOOKING_UNREAD_QUERY_KEY });
  }, [queryClient]);
};

export function formatUnreadCount(n) {
  const count = Number(n) || 0;
  if (count <= 0) return '';
  return count > 99 ? '99+' : String(count);
}

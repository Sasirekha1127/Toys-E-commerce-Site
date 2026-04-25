import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Ensures that a valid session exists in localStorage.
 * Accepts both regular users (toyCurrentUser) and sellers (toyCurrentSeller).
 * If neither is found, redirects to /auth.
 */
export function useUserGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const userRaw = localStorage.getItem('toyCurrentUser');
    const sellerRaw = localStorage.getItem('toyCurrentSeller');

    // Allow access if either a user or a seller is logged in
    if (!userRaw && !sellerRaw) {
      navigate('/auth', { replace: true });
      return;
    }

    // Validate whichever session exists
    try {
      if (userRaw) JSON.parse(userRaw);
      if (sellerRaw) JSON.parse(sellerRaw);
    } catch (e) {
      // Corrupted session — clear and redirect
      localStorage.removeItem('toyCurrentUser');
      localStorage.removeItem('toyCurrentSeller');
      navigate('/auth', { replace: true });
    }
  }, [navigate]);
}

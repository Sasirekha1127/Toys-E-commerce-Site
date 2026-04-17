import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * mode: 'dashboard'   → only fully onboarded sellers allowed
 * mode: 'onboarding'  → only not-yet-onboarded sellers allowed
 *                        (prevents re-visiting onboarding after completion)
 */
export function useSellerGuard(mode = 'dashboard') {
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('toyCurrentSeller');

    // No session → kick to auth
    if (!raw) {
      navigate('/auth', { replace: true });
      return;
    }

    const seller = JSON.parse(raw);
    const completed = seller.onboardingCompleted === true;

    if (mode === 'dashboard' && !completed) {
      // Incomplete seller trying to open dashboard → back to onboarding
      navigate('/seller/onboarding', { replace: true });
    }

    if (mode === 'onboarding' && completed) {
      // Completed seller trying to re-open onboarding → straight to dashboard
      navigate('/seller', { replace: true });
    }
  }, [navigate, mode]);
}
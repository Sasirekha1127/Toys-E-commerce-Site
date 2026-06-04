import React from 'react';
import { useUserGuard } from '../../hooks/useUserGuard';

/**
 * Wrap any user-targeted route with this component to ensure the user is logged in.
 */
export default function UserRouteGuard({ children }) {
  useUserGuard();
  return children;
}

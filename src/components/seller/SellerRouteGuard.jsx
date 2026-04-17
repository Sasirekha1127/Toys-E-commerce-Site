import { useSellerGuard } from '../../hooks/useSellerGuard';

/**
 * Wrap any seller route with this component.
 *
 * Usage:
 *   <SellerRouteGuard mode="dashboard"><SellerDashboard /></SellerRouteGuard>
 *   <SellerRouteGuard mode="onboarding"><SellerOnboarding /></SellerRouteGuard>
 */
export default function SellerRouteGuard({ children, mode = 'dashboard' }) {
  useSellerGuard(mode);
  return children;
}
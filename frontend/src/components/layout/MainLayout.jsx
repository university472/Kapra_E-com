import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import WhatsAppButton from '../ui/WhatsAppButton'
import { RecentPurchaseToast } from '../ui/SocialProof'
import PWAInstallBanner from '../ui/PWAInstallBanner'
import NewsletterPopup from '../ui/NewsletterPopup'
import AnnouncementBar from './AnnouncementBar' // ← ADDED

// Pages where footer is hidden on mobile (full-screen flows)
const NO_FOOTER_ROUTES = ['/checkout', '/login', '/register', '/verify-otp']

export default function MainLayout() {
  const { pathname } = useLocation()
  const hideFooter = NO_FOOTER_ROUTES.some((r) => pathname.startsWith(r))

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar /> {/* ← ADDED: before Navbar */}
      <Navbar />
      <main className="flex-1 pb-safe">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
      {/* Floating elements */}
      <WhatsAppButton />
      <PWAInstallBanner />
      <RecentPurchaseToast />
      <NewsletterPopup />
      <MobileBottomNav />
    </div>
  )
}

import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Stewardship from '@/pages/Stewardship';
import Pathway from '@/pages/Pathway';
import FourTurnings from '@/pages/FourTurnings';
import Admin from '@/pages/Admin';
import Login from '@/pages/Login';
import Activate from '@/pages/Activate';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Resources from '@/pages/Resources';
import Contact from '@/pages/Contact';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // This is a public marketing site with two gated areas, not an app that sits
  // wholly behind a login. Never bounce the whole shell to /login: that page is
  // itself a route here, so redirecting from it re-entered this check and looped,
  // nesting from_url on every pass. /resources and /admin prompt for sign-in
  // themselves, which is the only place a prompt belongs.
  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/stewardship" element={<Stewardship />} />
      <Route path="/estate-ready" element={<Pathway id="estate-ready" />} />
      <Route path="/sale-ready" element={<Pathway id="sale-ready" />} />
      <Route path="/harvest-share" element={<Pathway id="harvest-share" />} />
      <Route path="/the-four-turnings" element={<FourTurnings />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin" element={<Admin />} />
      {/* Not open sign-up: this is where someone the admin has already invited
          sets their password. Routed at /register too, in case that is where
          the platform's invitation email points. */}
      <Route path="/activate" element={<Activate />} />
      <Route path="/register" element={<Activate />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <PageTransition />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
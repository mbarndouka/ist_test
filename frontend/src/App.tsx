import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { Loader2 } from "lucide-react";
import { ROUTES } from "./lib/constants";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#ccff00] text-opacity-80" />
        <p className="mt-4 text-sm text-gray-500 font-medium">Initializing Secure Session...</p>
      </div>
    );
  }

  // If there's a user, render children; otherwise redirect to login
  return user ? children : <Navigate to={ROUTES.LOGIN} replace />;
};
// ADDED: Helper to prevent authenticated users from seeing login screen (Point 6)
const AuthRedirectWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Handled by inner components usually, but safe to return null here
  return user ? <Navigate to={ROUTES.DASHBOARD} replace /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            <Route
              path={ROUTES.LOGIN}
              element={
                <AuthRedirectWrapper>
                  <Login />
                </AuthRedirectWrapper>
              }
            />

            <Route
              path={ROUTES.DASHBOARD}
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  );

}

export default App;

import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/context/UserContext';
import { AlertTriangleIcon, HelpCircleIcon, HomeIcon, LogOutIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export function Component() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, checkAdminAccess } = useUser();

  // Try to check admin access again when the component mounts
  // This allows for handling cases where permissions might have changed
  useEffect(() => {
    const verifyAccess = async () => {
      const hasAccess = await checkAdminAccess();
      // If they now have access, navigate to dashboard
      if (hasAccess) {
        navigate('/dashboard');
      }
    };

    verifyAccess();
  }, [checkAdminAccess, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  }; // Attempt to get information about the page they were trying to access
  const attemptedPath = (location.state as { from?: string })?.from;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangleIcon className="w-12 h-12 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>

          <div className="space-y-2">
            <p className="text-muted-foreground">
              You don't have the necessary admin permissions to access this area.
            </p>
            {attemptedPath && (
              <p className="text-muted-foreground">
                <span className="font-medium">Attempted path:</span> {attemptedPath}
              </p>
            )}
            {user && (
              <p className="text-muted-foreground">
                Your account ({user.email}) is not authorized for admin access.
              </p>
            )}
            <p className="text-muted-foreground mt-2">
              Please contact an administrator if you believe this is an error.
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Go to Home</span>
          </Button>
          <Button
            onClick={() => navigate('/profile')}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
          >
            <HelpCircleIcon className="w-4 h-4" />
            <span>View Your Profile</span>
          </Button>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOutIcon className="w-4 h-4" />
            <span>Log Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

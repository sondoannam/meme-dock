import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/context/UserContext';
import { AlertTriangleIcon, HelpCircleIcon, HomeIcon, LogOutIcon, TimerIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCountdown } from '@/hooks/use-countdown';
import { ROUTE_PATH } from '@/constants/routes';

export function Component() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, checkAdminAccess } = useUser();

  const { seconds } = useCountdown({
    startSeconds: 5,
    onComplete: () => {
      void handleLogout();
    },
  });

  useEffect(() => {
    const verifyAccess = async () => {
      const hasAccess = await checkAdminAccess();
      // If they now have access, navigate to dashboard
      if (hasAccess) {
        navigate(ROUTE_PATH.DASHBOARD);
      }
    };

    verifyAccess();
  }, [checkAdminAccess, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Navigate anyway as a fallback
    } finally {
      navigate('/login', { state: { autoLogout: true } });
    }
  };

  const attemptedPath = (location.state as { from?: string })?.from;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangleIcon className="w-12 h-12 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>

          <Alert variant="destructive" className="mb-4">
            <TimerIcon className="h-4 w-4" />
            <AlertTitle>Automatic Logout</AlertTitle>
            <AlertDescription>
              You will be logged out in {seconds} {seconds === 1 ? 'second' : 'seconds'}.
            </AlertDescription>
          </Alert>

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
            onClick={() => navigate(ROUTE_PATH.HOME)}
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

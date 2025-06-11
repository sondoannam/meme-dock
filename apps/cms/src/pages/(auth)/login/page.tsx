import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/lib/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTE_PATH } from '@/constants/routes';
import { InlineLoading } from '@/components/custom/loading';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { LoginFormData, loginSchema } from '@/validators';
import { InputText } from '@/components/custom/form-field/input-text';
import { InputPassword } from '@/components/custom/form-field/input-password';

interface LocationState {
  from?: string;
}

export function Component() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useUser(); // Get the redirect path and other state from location
  const locationState = location.state as LocationState & { autoLogout?: boolean };
  const from = locationState?.from ?? ROUTE_PATH.DASHBOARD;
  const wasAutoLogout = locationState?.autoLogout;

  // Initialize form with react-hook-form and zod validation
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // If already authenticated, redirect to the intended destination
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Form submission handler
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      // Navigate will happen in the effect above
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials and try again.';

      console.error('Login failed:', err);

      // Show error in form
      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">CMS Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 mb-5">
              {wasAutoLogout && (
                <div className="p-3 bg-yellow-500/10 rounded-md text-center text-sm text-yellow-700 border border-yellow-200">
                  You've been automatically logged out due to insufficient permissions.
                </div>
              )}

              {form.formState.errors.root && (
                <div className="p-3 bg-destructive/10 rounded-md text-center text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}

              <InputText
                control={form.control}
                name="email"
                label="Email"
                placeholder="name@example.com"
                type="email"
                autoComplete="email"
              />

              <InputPassword
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
              />
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <InlineLoading size="sm" className="mr-2" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

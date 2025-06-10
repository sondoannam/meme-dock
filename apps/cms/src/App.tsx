import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from './lib/context/UserContext';

import routes from '~pages';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <RouterProvider router={createBrowserRouter(routes)} />
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;

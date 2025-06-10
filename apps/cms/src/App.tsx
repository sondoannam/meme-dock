import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from "@/components/ui/sonner"

import routes from '~pages';

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={createBrowserRouter(routes)} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;

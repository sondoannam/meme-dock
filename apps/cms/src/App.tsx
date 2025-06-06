import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';

import routes from '~pages';

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={createBrowserRouter(routes)} />
    </ThemeProvider>
  );
}

export default App;

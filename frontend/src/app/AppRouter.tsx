import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { AboutPage } from '../pages/about/AboutPage';
import { ArticlePage } from '../pages/article/ArticlePage';
import { HomePage } from '../pages/home/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SectionPage } from '../pages/section/SectionPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: ':section', element: <SectionPage /> },
      { path: ':section/:slug', element: <ArticlePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

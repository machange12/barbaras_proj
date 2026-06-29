import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '../components/layout/RootLayout'
import { HistoryPage } from '../pages/history/HistoryPage'
import { LandingPage } from '../pages/landing/LandingPage'
import { SalonDifferencePage } from '../pages/society/SalonDifferencePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'society',
        element: <SalonDifferencePage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

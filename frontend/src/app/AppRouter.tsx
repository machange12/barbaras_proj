import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RequireAuth } from '../components/auth/RequireAuth'
import { RootLayout } from '../components/layout/RootLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { CuratorDashboard } from '../pages/curator/CuratorDashboard'
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
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'curator',
        element: (
          <RequireAuth requireCurator>
            <CuratorDashboard />
          </RequireAuth>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

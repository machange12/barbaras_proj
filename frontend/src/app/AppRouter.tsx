import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RequireAuth } from '../components/auth/RequireAuth'
import { RootLayout } from '../components/layout/RootLayout'
import { LoginPage } from '../pages/auth/LoginPage'
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
            <div className="mx-auto max-w-5xl px-6 py-20 text-parchment">Curator dashboard coming soon.</div>
          </RequireAuth>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

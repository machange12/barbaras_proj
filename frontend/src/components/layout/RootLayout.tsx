import { Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="min-h-svh bg-ink text-parchment antialiased">
      <Outlet />
    </div>
  )
}

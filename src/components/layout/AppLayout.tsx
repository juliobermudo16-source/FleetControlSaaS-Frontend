import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Car, LogOut, Truck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
  { to: '/vehicles', label: 'Vehiculos', icon: Car, adminOnly: false },
]

export function AppLayout() {
  const { role, signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 border-r border-border bg-surface flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b border-border">
          <Truck className="text-primary" size={22} />
          <span className="font-bold">FleetControl</span>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems
            .filter((item) => !item.adminOnly || role === 'admin')
            .map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors',
                  location.pathname === item.to && 'bg-surface-hover text-text'
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
        </nav>

        <div className="p-2 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={signOut}>
            <LogOut size={18} /> Cerrar sesion
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Menu,
  Package,
  Key,
  FileText,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  TrendingUp,
  PieChart,
  Users,
  CreditCard,
  Shield
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Licenses', href: '/dashboard/licenses', icon: FileText },

  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Orders', href: '/dashboard/orders', icon: CreditCard },

  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Analytics', href: '/dashboard/analytics', icon: PieChart },

  { name: 'Security', href: '/dashboard/security', icon: Shield }
];

function Sidebar({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col h-full bg-slate-900 border-r border-slate-800 ${className}`}>
      <div className="flex items-center h-16 px-6 border-b border-slate-800">
        <TrendingUp className="h-6 w-6 text-blue-500 mr-3" />
        <span className="text-lg font-semibold text-white">Fluid Trading</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function DashboardLayout() {
  const { logout, userEmail } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-slate-800">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white mr-4">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-slate-800">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold text-white hidden sm:block">Admin Dashboard</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <Avatar className="h-8 w-8 bg-blue-600">
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {userEmail?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{userEmail || 'Admin'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
              <DropdownMenuLabel className="text-slate-300">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-950/50 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

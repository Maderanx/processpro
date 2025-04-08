import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
  Users,
  Check,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useNotificationStore } from '../../store/notifications';
import { format } from 'date-fns';
import { useAccessibility } from '../../hooks/useAccessibility';

interface SidebarLink {
  icon: React.ElementType;
  label: string;
  path: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, getUnreadNotifications, markAsRead, initializeNotifications } = useNotificationStore();
  const layoutRef = useRef<HTMLDivElement>(null);
  const { announce } = useAccessibility(layoutRef);

  const unreadNotifications = user ? getUnreadNotifications(user.id) : [];

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  useEffect(() => {
    if (isSidebarOpen) {
      announce('Sidebar opened');
    } else {
      announce('Sidebar closed');
    }
  }, [isSidebarOpen, announce]);

  const sidebarLinks: SidebarLink[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: Calendar, label: 'Meetings', path: '/meetings' },
    { icon: Users, label: 'Team', path: '/team' },
    { icon: Sparkles, label: 'Video Minutes', path: '/video-minutes' },
    ...(user?.role === 'manager' ? [{ icon: Settings, label: 'Manager Dashboard', path: '/manager-dashboard' }] : []),
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    setIsNotificationOpen(false);
  };

  return (
    <div ref={layoutRef} className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r w-64">
          <div className="flex items-center justify-between mb-6">
            <span className="text-2xl font-semibold">ProcessPro</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="space-y-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`${isSidebarOpen ? 'md:ml-64' : ''}`}>
        <header className="bg-white border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bell className="h-6 w-6 text-gray-600" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification.id)}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{notification.title}</h4>
                                <p className="text-sm text-gray-600">{notification.description}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                </p>
                              </div>
                              {!notification.read && (
                                <Check className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full"
                />
                <span className="font-medium">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
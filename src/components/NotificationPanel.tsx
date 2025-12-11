import { useState } from 'react';
import { X, Check, Bell, Clock, Calendar, AlertCircle, FileText, Users, Plus } from 'lucide-react';
import { notifications, Notification } from '../data/mockData';
import { User } from '../App';

interface NotificationPanelProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ user, isOpen, onClose }: NotificationPanelProps) {
  const [notificationList, setNotificationList] = useState<Notification[]>(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Chỉ học vụ và giám đốc mới được tạo thông báo
  const canCreateNotification = user.role === 'academic' || user.role === 'director';

  // Filter notifications by user role
  const userNotifications = notificationList.filter(notif => 
    !notif.targetRole || notif.targetRole.includes(user.role)
  );

  const filteredNotifications = filter === 'unread' 
    ? userNotifications.filter(n => !n.isRead)
    : userNotifications;

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotificationList(notificationList.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotificationList(notificationList.map(n => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <FileText className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />;
      case 'holiday':
        return <Calendar className="w-5 h-5" style={{ color: '#e67e22' }} />;
      case 'event':
        return <Users className="w-5 h-5" style={{ color: '#8b5cf6' }} />;
      case 'regulation':
        return <AlertCircle className="w-5 h-5" style={{ color: '#d63031' }} />;
      default:
        return <Bell className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'exam':
        return 'var(--brand-primary-100)';
      case 'holiday':
        return 'var(--pastel-orange-light)';
      case 'event':
        return 'var(--pastel-purple-light)';
      case 'regulation':
        return 'var(--pastel-pink-light)';
      default:
        return 'var(--brand-primary-50)';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exam': return 'Lịch thi';
      case 'holiday': return 'Nghỉ học';
      case 'event': return 'Sự kiện';
      case 'regulation': return 'Quy định';
      default: return 'Thông báo';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-gray-900">Thông báo</h2>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">{unreadCount} thông báo mới</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={filter === 'all' ? { backgroundColor: 'var(--brand-primary)' } : {}}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={filter === 'unread' ? { backgroundColor: 'var(--brand-primary)' } : {}}
            >
              Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
        </div>

        {/* Mark all as read */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm hover:underline"
              style={{ color: 'var(--brand-primary)' }}
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">
                {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  icon={getNotificationIcon(notification.type)}
                  bgColor={getNotificationBg(notification.type)}
                  typeLabel={getTypeLabel(notification.type)}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Notification Button */}
        {/* ❌ Removed - Create announcements in Documents module instead */}
        {/* {canCreateNotification && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:underline"
            >
              <Plus className="w-4 h-4" />
              Tạo thông báo mới
            </button>
          </div>
        )} */}
      </div>
    </>
  );
}

interface NotificationItemProps {
  notification: Notification;
  icon: React.ReactNode;
  bgColor: string;
  typeLabel: string;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, icon, bgColor, typeLabel, onMarkAsRead }: NotificationItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`p-4 transition-colors ${
        notification.isRead ? 'bg-white' : 'bg-blue-50'
      } hover:bg-gray-50 cursor-pointer`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bgColor }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <h3 className="text-gray-900 mb-1">{notification.title}</h3>
              <span className="inline-block px-2 py-0.5 rounded text-xs" style={{ backgroundColor: bgColor, color: 'var(--brand-primary-900)' }}>
                {typeLabel}
              </span>
            </div>
            {!notification.isRead && (
              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: 'var(--brand-primary)' }} />
            )}
          </div>

          <p className={`text-sm text-gray-700 mb-2 ${expanded ? '' : 'line-clamp-2'}`}>
            {notification.content}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{new Date(notification.date).toLocaleDateString('vi-VN')}</span>
              <span>•</span>
              <span>{notification.author}</span>
            </div>
          </div>

          {!notification.isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="flex items-center gap-1 text-xs mt-2 hover:underline"
              style={{ color: 'var(--brand-primary)' }}
            >
              <Check className="w-3 h-3" />
              Đánh dấu đã đọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../services/client';
import { initializeNativePush, PUSH_ACTION_EVENT } from '../../services/nativePush';
import { getSafeInternalRoute } from '../../utils/safeInternalRoute';
import useNotificationStore from '../../store/useNotificationStore';

const NativePlatformBootstrap = () => {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!userId) return;
    void initializeNativePush({
      userId,
      registerToken: (token) => apiClient.devices.registerPush(token),
      refreshNotifications: () => Promise.all([
        useNotificationStore.getState().loadNotifications(),
        useNotificationStore.getState().loadUnreadCount(),
      ]),
    });
  }, [userId]);

  useEffect(() => {
    const handlePushAction = (event) => {
      const route = getSafeInternalRoute(event?.detail?.route);
      if (route) navigate(route);
    };
    window.addEventListener(PUSH_ACTION_EVENT, handlePushAction);
    return () => window.removeEventListener(PUSH_ACTION_EVENT, handlePushAction);
  }, [navigate]);

  return null;
};

export default NativePlatformBootstrap;

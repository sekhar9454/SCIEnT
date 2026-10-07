import { useEffect, useState } from 'react';

const VIEW_MODES = ['stream', 'carousel', 'grid'];
const DEFAULT_VIEW = 'stream';

// The public timeline view is set by admins (Settings dashboard → timelineDefaultView);
// visitors can't change it, so this hook exposes the value only.
const useTimelineView = () => {
  const [viewMode, setViewMode] = useState(DEFAULT_VIEW);

  useEffect(() => {
    const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
    let cancelled = false;
    fetch(`${API_BASE}/api/admin/settings/public`)
      .then((res) => res.json())
      .then((resData) => {
        const view = resData?.data?.timelineDefaultView;
        if (!cancelled && VIEW_MODES.includes(view)) setViewMode(view);
      })
      .catch((err) => console.log('Using default timeline view:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  return viewMode;
};

export default useTimelineView;

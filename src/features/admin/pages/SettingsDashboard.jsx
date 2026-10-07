import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, LogOut, Save, Loader2, Zap, Layers, Grid } from 'lucide-react';
import { toast } from 'react-toastify';

const SettingsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    timelineDefaultView: 'stream',
  });

  const { token, logout, API_BASE } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.data) {
          setSettings((prev) => ({ ...prev, ...res.data.data }));
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast.error('Failed to load admin settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token, API_BASE]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.put(`${API_BASE}/api/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) {
        setSettings((prev) => ({ ...prev, ...res.data.data }));
      }
      toast.success('Timeline settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const viewOptions = [
    {
      id: 'stream',
      label: 'Circuit Node Stream',
      icon: Zap,
      desc: 'Vertical cybernetic node flow with interactive energy lines.',
    },
    {
      id: 'carousel',
      label: '3D Stage Slider',
      icon: Layers,
      desc: 'Interactive 3D stage slider showcase with thumbnail picker.',
    },
    {
      id: 'grid',
      label: 'Matrix Grid',
      icon: Grid,
      desc: 'High-density tile matrix grid display.',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="text-yellow-400 w-8 h-8" />
            Timeline <span className="text-yellow-400">Settings</span>
          </h1>
          <p className="text-zinc-400 mt-1">Configure the view mode visitors see on the public Timeline</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-8 flex bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl w-full sm:w-fit gap-1 backdrop-blur-sm">
        <Link
          to="/admin/team"
          className={`flex-1 sm:flex-none text-center px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            location.pathname.includes('/admin/team')
              ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/10'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          Team Members
        </Link>
        <Link
          to="/admin/projects"
          className={`flex-1 sm:flex-none text-center px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            location.pathname.includes('/admin/projects')
              ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/10'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          Projects & Clubs
        </Link>
        <Link
          to="/admin/settings"
          className={`flex-1 sm:flex-none text-center px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            location.pathname.includes('/admin/settings')
              ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/10'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          Timeline Settings
        </Link>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl space-y-6">
          {/* Default View Mode Selector */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold text-white">Default Timeline View Mode</h2>
            </div>
            <p className="text-xs text-zinc-400">
              Select which view mode will load by default when users visit the public Timeline page (`/timeline`).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {viewOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = settings.timelineDefaultView === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSettings((prev) => ({ ...prev, timelineDefaultView: opt.id }))}
                    className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-yellow-400/10 border-yellow-400 shadow-lg shadow-yellow-400/10'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <input
                        type="radio"
                        name="timelineDefaultView"
                        checked={isSelected}
                        onChange={() => setSettings((prev) => ({ ...prev, timelineDefaultView: opt.id }))}
                        className="accent-yellow-400 w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-yellow-400' : 'text-white'}`}>
                        {opt.label}
                      </h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
            <p className="text-xs text-yellow-300/90 leading-relaxed">
              💡 <strong>Tip:</strong> Changes saved here are applied immediately to all public users visiting the Timeline page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;

import { Settings as SettingsIcon, User, Bell, Shield, Globe, Palette } from 'lucide-react';

const settingsSections = [
  {
    icon: User,
    title: 'Profile Settings',
    description: 'Update your name, email, and profile picture',
    badge: null,
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Manage deadline reminders and email alerts',
    badge: '3 active',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Password, two-factor authentication, and sessions',
    badge: null,
  },
  {
    icon: Globe,
    title: 'Integrations',
    description: 'Connect RS.ge portal and third-party services',
    badge: 'Beta',
  },
  {
    icon: Palette,
    title: 'Appearance',
    description: 'Theme, language, and display preferences',
    badge: null,
  },
];

export default function Settings() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D1F3C]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#02C39A] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            A
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-[#0D1F3C] text-lg">Ana Beridze</h2>
            <p className="text-gray-500 text-sm">ana.beridze@finsort.ge</p>
            <p className="text-gray-400 text-xs mt-0.5">Senior Accountant · Tbilisi, Georgia</p>
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-3">
        {settingsSections.map(({ icon: Icon, title, description, badge }) => (
          <div
            key={title}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:border-[#028090] hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-[#0D1F3C]">{title}</p>
                {badge && (
                  <span className="px-2 py-0.5 bg-teal-100 text-[#028090] text-xs font-medium rounded-full">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
            <SettingsIcon size={16} className="text-gray-300 flex-shrink-0" />
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">FinSort v1.0 · Built for Georgian Accountants</p>
      </div>
    </div>
  );
}

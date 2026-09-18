import { useQuery } from '@tanstack/react-query';
import { Link, Outlet } from 'react-router-dom';
import { useViewer } from './DevViewerContext';
import { getMembers } from '../data';
import { BottomNav } from '../components/BottomNav';
import { t, formatTemplate } from '../i18n/he';

export function AppLayout() {
  const { viewerId, setViewerId } = useViewer();
  const { data: members } = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });

  return (
    <div className="min-h-screen bg-bg pb-[70px]">
      <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-line bg-bg">
        <div className="flex items-center gap-2">
          <span className="flex" dir="ltr" aria-hidden="true">
            <i className="h-[18px] w-[18px] rounded-full border border-blue" />
            <i className="h-[18px] w-[18px] rounded-full border border-copper -ml-2" />
          </span>
          <b className="font-logo text-[24px] tracking-[-1px] text-blue" dir="ltr">
            {t.brand.name}
          </b>
        </div>

        {import.meta.env.DEV && members && (
          <div className="flex items-center gap-1.5 text-[11px]" aria-label={t.common.devTools}>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setViewerId(m.id)}
                aria-pressed={viewerId === m.id}
                className={`rounded-full px-2.5 py-1 border ${
                  viewerId === m.id ? 'bg-blue text-white border-blue' : 'border-line text-muted'
                }`}
              >
                {formatTemplate(t.common.devViewerLabel, { name: m.displayName })}
              </button>
            ))}
            <Link to="/canvas" className="text-blue underline px-1">
              canvas
            </Link>
          </div>
        )}

        <Link to="/settings" aria-label={t.settings.title} className="text-muted text-[12px]">
          ⚙
        </Link>
      </header>

      <main className="max-w-[480px] mx-auto px-[22px] py-5">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}

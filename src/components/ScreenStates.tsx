import { t, formatTemplate } from '../i18n/he';
import { formatDateTimeShort } from '../lib/date';
import { Card } from './Card';
import { Button } from './Button';

export function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label={t.common.duetLoading} className="animate-pulse">
      <div className="h-6 w-2/3 bg-soft rounded mb-5" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-[70px] bg-soft rounded-card mb-3" />
      ))}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <Card className="text-center text-muted text-[13px] py-8">
      <p>{message}</p>
    </Card>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card className="border-r-[3px] border-r-alertbar">
      <h4 className="text-[13px] font-medium mb-1">{t.errors.genericTitle}</h4>
      <p className="text-[12px] text-muted">{t.errors.genericBody}</p>
      {onRetry && (
        <Button variant="text" onClick={onRetry} className="pt-2.5">
          {t.common.retry}
        </Button>
      )}
    </Card>
  );
}

export function ConnectionBrokenBanner({ lastSyncedAt }: { lastSyncedAt: string | null }) {
  const time = lastSyncedAt ? formatDateTimeShort(lastSyncedAt) : '—';
  return (
    <Card className="border-r-[3px] border-r-alertbar">
      <h4 className="text-[13px] font-medium mb-1">{t.errors.connectionBrokenTitle}</h4>
      <p className="text-[12px] text-muted">{t.errors.connectionBrokenBody}</p>
      <p className="text-[11px] text-muted mt-1">{formatTemplate(t.common.lastUpdated, { time })}</p>
    </Card>
  );
}

export function ConsentExpiredBanner({ onRenew }: { onRenew?: () => void }) {
  return (
    <Card className="border-r-[3px] border-r-alertbar">
      <h4 className="text-[13px] font-medium mb-1">{t.errors.consentExpiredTitle}</h4>
      <p className="text-[12px] text-muted">{t.errors.consentExpiredBody}</p>
      {onRenew && (
        <Button variant="text" onClick={onRenew} className="pt-2.5">
          {t.errors.renewConsent}
        </Button>
      )}
    </Card>
  );
}

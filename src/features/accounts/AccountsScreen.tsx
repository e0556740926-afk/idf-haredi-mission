import { useState } from 'react';
import { useViewer } from '../../app/DevViewerContext';
import { useAccountsScreen } from './hooks';
import { PageHead } from '../../components/PageHead';
import { VisibilityBadge } from '../../components/VisibilityBadge';
import { Money } from '../../components/Money';
import { Card } from '../../components/Card';
import { Switch } from '../../components/Switch';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Skeleton, ErrorState, EmptyState, ConnectionBrokenBanner } from '../../components/ScreenStates';
import { t } from '../../i18n/he';
import type { AccountRow, Visibility } from '../../data/types';

const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: 'shared', label: t.visibility.shared },
  { value: 'summary_only', label: t.visibility.summary },
  { value: 'private', label: t.visibility.private },
];

const PREVIEW_TEXT: Record<Visibility, string> = {
  shared: t.accounts.previewShared,
  summary_only: t.accounts.previewSummary,
  private: t.accounts.previewPrivate,
};

export function AccountsScreen() {
  const { viewerId } = useViewer();
  const { members, accounts, changeVisibility } = useAccountsScreen(viewerId);
  const [importOpen, setImportOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  if (members.isPending || accounts.isPending) return <Skeleton rows={4} />;
  if (members.isError || accounts.isError) return <ErrorState />;

  return (
    <div>
      <PageHead eyebrow={t.accounts.eyebrow} title={t.accounts.title} members={members.data} />
      <p className="text-[12px] text-muted mb-4">{t.accounts.intro}</p>

      {accounts.data.length === 0 ? (
        <EmptyState message={t.empty.accounts} />
      ) : (
        accounts.data.map((account) => (
          <AccountControl
            key={account.id}
            account={account}
            viewerId={viewerId}
            onChange={(to) => changeVisibility.mutate({ accountId: account.id, to })}
          />
        ))
      )}

      <div className="flex gap-2.5 mt-4">
        <Button variant="secondary" onClick={() => setManualOpen(true)}>
          {t.accounts.addManual}
        </Button>
        <Button variant="secondary" onClick={() => setImportOpen(true)}>
          {t.accounts.importCsv}
        </Button>
      </div>

      <Modal open={manualOpen} onClose={() => setManualOpen(false)}>
        <h2 className="text-2xl mb-4">{t.accounts.addManual}</h2>
        <label className="text-[12px] text-muted block mt-2.5">
          {t.home.accountsTitle}
          <input className="w-full border border-line rounded-[9px] p-2.5 mt-1.5 bg-white text-ink" />
        </label>
        <Button full className="mt-[18px]" onClick={() => setManualOpen(false)}>
          {t.common.save}
        </Button>
      </Modal>

      <Modal open={importOpen} onClose={() => setImportOpen(false)}>
        <h2 className="text-2xl mb-4">{t.accounts.importCsv}</h2>
        <input type="file" accept=".csv" className="mt-2.5" />
        <Button full className="mt-[18px]" onClick={() => setImportOpen(false)}>
          {t.common.done}
        </Button>
      </Modal>
    </div>
  );
}

function AccountControl({
  account,
  viewerId,
  onChange,
}: {
  account: AccountRow;
  viewerId: string;
  onChange: (to: Visibility) => void;
}) {
  const isOwner = account.ownerId === viewerId;
  const isHousehold = account.ownerId === null;

  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <b className="font-medium">{account.displayName}</b>
          {account.maskedNumber && <div className="text-[11px] text-muted">•••• {account.maskedNumber}</div>}
        </div>
        {account.balance !== null ? <Money amount={account.balance} /> : '—'}
      </div>

      {account.syncState === 'broken' && <div className="mt-2.5">
        <ConnectionBrokenBanner lastSyncedAt={account.lastSyncedAt} />
      </div>}

      {isOwner && !isHousehold ? (
        <>
          <div className="mt-3">
            <Switch options={VISIBILITY_OPTIONS} value={account.visibility} onChange={onChange} ariaLabel={account.displayName} />
          </div>
          <Card tone="soft" className="mb-0">
            <h3 className="text-[13px] text-blue mb-1">{t.accounts.previewTitle}</h3>
            <p className="text-[12px] text-blue">{PREVIEW_TEXT[account.visibility]}</p>
          </Card>
        </>
      ) : (
        <div className="mt-2.5 flex items-center justify-between">
          <VisibilityBadge visibility={account.visibility} />
          {isHousehold && <small className="text-muted">{t.accounts.cannotHideHousehold}</small>}
        </div>
      )}
    </Card>
  );
}

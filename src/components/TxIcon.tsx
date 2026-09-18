import { Icon, type IconName } from './Icon';

export function TxIcon({ icon }: { icon: IconName }) {
  return (
    <div className="h-[34px] w-[34px] shrink-0 rounded-[10px] grid place-items-center bg-white border border-line text-blue">
      <Icon name={icon} className="h-[17px] w-[17px]" />
    </div>
  );
}

/**
 * Copied 1:1 from design/prototype.html's `icons` object — see
 * docs/08-design-system.md.
 */
export const ICON_PATHS = {
  today: '<path d="M3 11 12 3l9 8v10h-6v-7H9v7H3Z"/>',
  flow: '<path d="M3 4v16h18M5 14l5-5 5 7 6-10"/>',
  activity: '<path d="M5 4h14v17l-3-2-4 2-4-2-3 2ZM8 8h8M8 12h8M8 16h4"/>',
  home: '<path d="M3 9h18M5 9v10m5-10v10m4-10v10m5-10v10M2 21h20M3 7l9-5 9 5"/>',
  ritual:
    '<circle cx="9" cy="8" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2"/>',
  bag: '<path d="M5 7h14l2 14H3ZM9 9V6a3 3 0 0 1 6 0v3"/>',
  gift: '<path d="M3 10h18v4H3ZM5 14v7h14v-7M12 10v11"/><path d="M12 10C3 10 5 1 9 4ZM12 10c9 0 7-9 3-6Z"/>',
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] ?? ICON_PATHS.bag }}
    />
  );
}

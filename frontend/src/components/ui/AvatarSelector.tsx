import { cn } from '@/lib/utils';

const AVATAR_OPTIONS = [
  'avatar_1',
  'avatar_2',
  'avatar_3',
  'avatar_4',
  'avatar_5',
  'avatar_6',
  'avatar_7',
  'avatar_8',
  'avatar_9',
  'avatar_10',
] as const;

export type AvatarId = (typeof AVATAR_OPTIONS)[number];

interface AvatarSelectorProps {
  selectedAvatar: string | null;
  onSelect: (avatarId: string) => void;
  className?: string;
}

/**
 * AvatarSelector component for selecting from 10 pre-defined Reddit-style avatars.
 * Requirements: 1.1, 1.3, 1.4
 */
export function AvatarSelector({
  selectedAvatar,
  onSelect,
  className,
}: AvatarSelectorProps) {
  return (
    <div
      className={cn('grid grid-cols-5 gap-3', className)}
      role="radiogroup"
      aria-label="Select an avatar"
    >
      {AVATAR_OPTIONS.map((avatarId) => {
        const isSelected = selectedAvatar === avatarId;
        return (
          <button
            key={avatarId}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(avatarId)}
            className={cn(
              'relative aspect-square rounded-full overflow-hidden transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
              'hover:scale-105',
              isSelected
                ? 'ring-3 ring-purple-500 scale-105'
                : 'ring-2 ring-white/20 hover:ring-white/40'
            )}
          >
            <img
              src={`/avatars/${avatarId}.svg`}
              alt={`Avatar option ${avatarId.replace('avatar_', '')}`}
              className="w-full h-full object-cover"
            />
            {isSelected && (
              <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export { AVATAR_OPTIONS };
export default AvatarSelector;

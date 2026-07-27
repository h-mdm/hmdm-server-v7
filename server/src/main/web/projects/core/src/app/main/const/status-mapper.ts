import { TStatus, TStatusColor } from 'hmdm-ui-kit';

export const STATUS_MAPPER: Record<string, TStatus> = {
  red: { color: 'red', label: 'Offline' },
  green: { color: 'green', label: 'Online' },
  yellow: { color: 'yellow', label: 'Away' },
  gray: { color: 'gray', label: 'Unknown' },
};

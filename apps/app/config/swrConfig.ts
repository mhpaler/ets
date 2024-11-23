import { fetcher } from "@app/utils/fetchers";
export const SWR_CONFIG = {
  refreshInterval: 30000, // 30 seconds instead of 3 seconds
  revalidateOnFocus: false,
  revalidateOnMount: true,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  dedupingInterval: 5000,
  fetcher: fetcher, // Keep your existing fetcher
} as const;

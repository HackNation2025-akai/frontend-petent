import useSWR from "swr";
import { ApiError, swrFetcher, withQuery } from "@/shared/api/client";
import type { HistoryResponse } from "@/shared/api/types";

export function useHistory(sessionId: string | null, params?: { limit?: number; offset?: number }) {
  const key = sessionId ? withQuery(`/sessions/${sessionId}/history`, params) : null;
  const fetcher = async (url: string) => {
    try {
      return await swrFetcher(url);
    } catch (error) {
      if (error instanceof ApiError && [401, 403, 404, 422].includes(error.status)) {
        return null as unknown as HistoryResponse;
      }
      throw error;
    }
  };
  return useSWR<HistoryResponse | null>(key, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
}


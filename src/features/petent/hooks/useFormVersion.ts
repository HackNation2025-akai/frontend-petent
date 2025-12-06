import useSWR from "swr";
import { swrFetcher } from "@/shared/api/client";
import type { FormSnapshotResponse } from "@/shared/api/types";

export function useFormVersion(sessionId: string | null, version: number | null) {
  const key =
    sessionId && version !== null
      ? `/sessions/${sessionId}/forms/${version}`
      : null;
  return useSWR<FormSnapshotResponse>(key, swrFetcher);
}


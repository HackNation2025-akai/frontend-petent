import { useCallback, useEffect, useMemo, useState } from "react";
import { closeSession, createSession, refreshSession } from "@/shared/api/endpoints";
import { ApiError, clearAuthToken, setAuthToken } from "@/shared/api/client";
import type { SessionResponse } from "@/shared/api/types";

type SessionState = {
  sessionId: string | null;
  token: string | null;
  expiresAt: string | null;
  status: string | null;
};

const STORAGE_KEY = "petent_session_v1";

const loadStoredSession = (): SessionState => {
  if (typeof window === "undefined") {
    return { sessionId: null, token: null, expiresAt: null, status: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessionId: null, token: null, expiresAt: null, status: null };
    return JSON.parse(raw) as SessionState;
  } catch {
    return { sessionId: null, token: null, expiresAt: null, status: null };
  }
};

const storeSession = (state: SessionState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const clearSessionStorage = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export function useSession() {
  const [state, setState] = useState<SessionState>(() => loadStoredSession());
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthToken(state.token);
  }, [state.token]);

  const reset = useCallback(() => {
    const cleared: SessionState = { sessionId: null, token: null, expiresAt: null, status: null };
    setState(cleared);
    setAuthToken(null);
    clearAuthToken?.();
    clearSessionStorage();
    setReady(false);
  }, []);

  const updateState = useCallback((res: SessionResponse) => {
    const next: SessionState = {
      sessionId: res.session_id,
      token: res.session_token,
      expiresAt: res.expires_at,
      status: res.status,
    };
    setState(next);
    setAuthToken(next.token);
    storeSession(next);
  }, []);

  const createFresh = useCallback(async () => {
    try {
      const created = await createSession();
      updateState(created);
      return {
        sessionId: created.session_id,
        token: created.session_token,
        expiresAt: created.expires_at,
        status: created.status,
      };
    } catch (error) {
      reset();
      throw error;
    }
  }, [updateState, reset]);

  const ensureSession = useCallback(async () => {
    if (loading) return state;
    setLoading(true);
    try {
      // Jeśli mamy sesję w localStorage, waliduj ją przez refresh (backend sprawdzi token)
      if (state.sessionId && state.token) {
        try {
          const refreshed = await refreshSession(state.sessionId);
          updateState(refreshed);
          setReady(true);
          return {
            sessionId: refreshed.session_id,
            token: refreshed.session_token,
            expiresAt: refreshed.expires_at,
            status: refreshed.status,
          };
        } catch (error) {
          // Sesja nieaktualna/nieistniejąca - utwórz nową
          if (error instanceof ApiError && [401, 403, 404, 422].includes(error.status)) {
            reset();
            const fresh = await createFresh();
            setReady(true);
            return fresh;
          }
          throw error;
        }
      }
      // Brak sesji - utwórz nową
      const fresh = await createFresh();
      setReady(true);
      return fresh;
    } finally {
      setLoading(false);
    }
  }, [loading, state, updateState, reset, createFresh]);

  const refresh = useCallback(async () => {
    if (!state.sessionId) return null;
    const refreshed = await refreshSession(state.sessionId);
    updateState(refreshed);
    return refreshed;
  }, [state.sessionId, updateState]);

  const close = useCallback(async () => {
    if (!state.sessionId) return;
    try {
      await closeSession(state.sessionId);
    } finally {
      reset();
    }
  }, [state.sessionId, reset]);

  const sessionInfo = useMemo(
    () => ({
      sessionId: state.sessionId,
      token: state.token,
      expiresAt: state.expiresAt,
      status: state.status,
      loading,
      ready,
    }),
    [state, loading, ready]
  );

  return {
    ...sessionInfo,
    ensureSession,
    refresh,
    reset,
    close,
  };
}


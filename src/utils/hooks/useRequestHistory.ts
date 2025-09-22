import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { HistoryAPI } from '../api/history';

export const useRequestHistory = (user: User | null) => {
  const [isSaving, setIsSaving] = useState(false);
  const historyAPI = new HistoryAPI();

  const saveRequestToHistory = useCallback(
    async (requestData: {
      method: string;
      url: string;
      headers: Array<{ key: string; value: string; enabled: boolean }>;
      body: string;
      status: number;
      duration: number;
      requestSize: number;
      responseSize: number;
      errorDetails?: string;
    }) => {
      if (!user) return;

      setIsSaving(true);
      try {
        await historyAPI.saveRequest(requestData);
      } catch (error) {
        console.error('Failed to save request to history:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [user, historyAPI]
  );

  return {
    saveRequestToHistory,
    isSaving,
  };
};

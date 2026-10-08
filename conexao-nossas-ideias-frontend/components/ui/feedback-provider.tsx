'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { Alert, Snackbar, type AlertColor } from '@mui/material';

type Feedback = { message: string; severity: AlertColor; key: number };
type Notify = (message: string, severity?: AlertColor) => void;

const FeedbackContext = createContext<Notify | null>(null);

/** App-wide snackbar, so a dialog can report success after it has closed. */
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [open, setOpen] = useState(false);

  const notify = useCallback<Notify>((message, severity = 'success') => {
    setFeedback({ message, severity, key: Date.now() });
    setOpen(true);
  }, []);

  return (
    <FeedbackContext.Provider value={notify}>
      {children}
      <Snackbar
        // A new key restarts the auto-hide timer when messages arrive back to back.
        key={feedback?.key}
        open={open}
        autoHideDuration={4000}
        onClose={(_, reason) => reason !== 'clickaway' && setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {/* Keep the last message mounted during the exit transition. */}
        <Alert
          severity={feedback?.severity ?? 'success'}
          variant="filled"
          onClose={() => setOpen(false)}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
}

export function useNotify() {
  const notify = useContext(FeedbackContext);
  if (!notify) throw new Error('useNotify must be used inside <FeedbackProvider>.');
  return notify;
}

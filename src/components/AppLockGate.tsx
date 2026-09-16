"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import {
  isAppUnlocked,
  isCorrectPassword,
  lockApp,
  unlockApp,
} from "@/lib/appLock";

const AppLockContext = createContext<(() => void) | null>(null);

export function useLockApp(): (() => void) | null {
  return useContext(AppLockContext);
}

export function AppLockGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(isAppUnlocked());
    setReady(true);
  }, []);

  function handleUnlock() {
    unlockApp();
    setUnlocked(true);
  }

  function handleLock() {
    lockApp();
    setUnlocked(false);
  }

  if (!ready) {
    return <LockSplash />;
  }

  if (!unlocked) {
    return (
      <AppLockContext.Provider value={handleLock}>
        <PasswordScreen onUnlock={handleUnlock} />
      </AppLockContext.Provider>
    );
  }

  return (
    <AppLockContext.Provider value={handleLock}>
      {children}
    </AppLockContext.Provider>
  );
}

function LockSplash() {
  return (
    <div className="min-h-dvh bg-background" aria-busy="true" aria-hidden />
  );
}

function PasswordScreen({ onUnlock }: { onUnlock: () => void }) {
  const passwordId = useId();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isCorrectPassword(password)) {
      setError("Incorrect password");
      return;
    }

    setError(undefined);
    onUnlock();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-lg font-semibold tracking-tight text-white">
            S
          </span>
          <h1 className="mt-4 text-[22px] font-semibold tracking-tight text-foreground">
            Stall Sales Manager
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Enter the password to continue.
          </p>
        </div>

        <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit}>
          <Field label="Password" htmlFor={passwordId} error={error}>
            <Input
              id={passwordId}
              name="password"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              invalid={Boolean(error)}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) {
                  setError(undefined);
                }
              }}
            />
          </Field>
          <Button type="submit" size="lg" className="w-full">
            Unlock
          </Button>
        </form>
      </Card>
    </div>
  );
}

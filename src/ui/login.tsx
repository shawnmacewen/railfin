import React, { FormEvent, useMemo, useState } from 'react';

function resolvePostLoginRedirect(nextParam: string | null): string {
  if (!nextParam) {
    return '/app';
  }

  // UI contract only: allow internal relative paths for `next`, otherwise fallback.
  if (nextParam.startsWith('/') && !nextParam.startsWith('//')) {
    return nextParam;
  }

  return '/app';
}

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInMessage, setSignInMessage] = useState('');

  const nextParam = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return new URLSearchParams(window.location.search).get('next');
  }, []);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Placeholder only: no auth SDK/backend integration in this baseline.
    const redirectTarget = resolvePostLoginRedirect(nextParam);

    setSignInMessage(
      `Sign-in placeholder complete. On successful auth, redirect to: ${redirectTarget}`,
    );
  };

  return (
    <section>
      <h1>Sign in</h1>
      <form onSubmit={handleSignIn}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit">Sign In</button>
      </form>

      {signInMessage ? <p>{signInMessage}</p> : null}
    </section>
  );
}

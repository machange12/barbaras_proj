import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { register } from '../../lib/api/auth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestPassword, setRequestPassword] = useState('');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    } catch {
      setError('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestStatus(null);
    setRequestError(null);
    setIsRequesting(true);
    try {
      await register(requestName, requestEmail, requestPassword);
      setRequestName('');
      setRequestEmail('');
      setRequestPassword('');
      setRequestStatus('Account request submitted. A curator must approve it before you can sign in.');
    } catch {
      setRequestError('Unable to submit account request. The email may already exist.');
    } finally {
      setIsRequesting(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-6xl gap-6 px-6 py-20 lg:grid-cols-2">
      <div className="rounded-3xl border border-brass/30 bg-[#2d1c13]/85 p-8 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
        <h1 className="font-serif text-3xl uppercase tracking-[0.24em] text-parchment">Sign in</h1>
        <p className="mt-3 text-sm text-parchment/70">Access curator tools and protected salon content.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm text-parchment/80">
            <span className="mb-2 block">Email</span>
            <input
              className="w-full rounded-xl border border-brass/30 bg-[#150f0b] px-4 py-3 text-parchment outline-none focus:border-brass"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block text-sm text-parchment/80">
            <span className="mb-2 block">Password</span>
            <input
              className="w-full rounded-xl border border-brass/30 bg-[#150f0b] px-4 py-3 text-parchment outline-none focus:border-brass"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error ? <p className="text-sm text-[#ffb59e]">{error}</p> : null}
          <button
            className="w-full rounded-xl bg-brass px-4 py-3 font-medium text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-brass/30 bg-[#2d1c13]/85 p-8 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
        <h2 className="font-serif text-3xl uppercase tracking-[0.24em] text-parchment">Request access</h2>
        <p className="mt-3 text-sm text-parchment/70">Create credentials for a membership account. A curator will approve the request before login is enabled.</p>
        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          <label className="block text-sm text-parchment/80">
            <span className="mb-2 block">Name</span>
            <input
              className="w-full rounded-xl border border-brass/30 bg-[#150f0b] px-4 py-3 text-parchment outline-none focus:border-brass"
              onChange={(event) => setRequestName(event.target.value)}
              required
              type="text"
              value={requestName}
            />
          </label>
          <label className="block text-sm text-parchment/80">
            <span className="mb-2 block">Email</span>
            <input
              className="w-full rounded-xl border border-brass/30 bg-[#150f0b] px-4 py-3 text-parchment outline-none focus:border-brass"
              onChange={(event) => setRequestEmail(event.target.value)}
              required
              type="email"
              value={requestEmail}
            />
          </label>
          <label className="block text-sm text-parchment/80">
            <span className="mb-2 block">Password</span>
            <input
              className="w-full rounded-xl border border-brass/30 bg-[#150f0b] px-4 py-3 text-parchment outline-none focus:border-brass"
              minLength={8}
              onChange={(event) => setRequestPassword(event.target.value)}
              required
              type="password"
              value={requestPassword}
            />
          </label>
          {requestError ? <p className="text-sm text-[#ffb59e]">{requestError}</p> : null}
          {requestStatus ? <p className="text-sm text-emerald-300">{requestStatus}</p> : null}
          <button
            className="w-full rounded-xl bg-brass px-4 py-3 font-medium text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isRequesting}
            type="submit"
          >
            {isRequesting ? 'Submitting...' : 'Submit for approval'}
          </button>
        </form>
      </div>
    </main>
  );
}

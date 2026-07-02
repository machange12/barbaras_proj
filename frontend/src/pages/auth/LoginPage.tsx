import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 py-20">
      <div className="w-full rounded-3xl border border-brass/30 bg-[#2d1c13]/85 p-8 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
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
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}

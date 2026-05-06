import { useState, FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../lib/api';
import './LoginScreen.css';

type LoginScreenProps = {
  onLogin: () => void;
  onSignUp?: () => void;
  onGoogleSignIn?: () => void;
};

export function LoginScreen({ onLogin, onSignUp, onGoogleSignIn }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Call the backend login API
      const res = await authApi.login({ email, password });

      // Store returned token and user_id
      if (res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
        if (res.data?.user?.id) {
          localStorage.setItem('user_id', res.data.user.id);
        }
        onLogin();
      } else {
        setErrorMsg('No token received. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <section className="login-form-wrap">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <header className="login-form__header">
            <div className="login-visual__brand">
              <img
                src="/assets/logo.png"
                alt="Dopamine Coach logo"
                className="login-visual__brand-mark"
              />
              Dopamine Coach
            </div>
            <br />
            <br />
            <h1>Welcome back!</h1>
            <p>Sign in to pick up where you left off.</p>
          </header>

          {errorMsg && <div className="login-error-msg" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{errorMsg}</div>}

          <div className="login-field">
            <label htmlFor="login-email">Email Address</label>
            <div className="login-field__control">
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="login-field__control login-field__control--password">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-primary" disabled={isLoading}>
            {isLoading ? <span className="login-spinner" /> : 'Login'}
          </button>

          <div className="login-divider">OR</div>

          <button
            type="button"
            className="login-google"
            onClick={onGoogleSignIn}
          >
            <GoogleMark />
            Sign in with Google
          </button>

          <div className="login-footer">
            <span>Don't have an account?</span>
            <button type="button" className="login-signup" onClick={onSignUp}>
              Sign Up
            </button>
          </div>
        </form>
      </section>

      <aside className="login-visual" aria-hidden="true">
        <span className="login-visual__blob login-visual__blob--a" />
        <span className="login-visual__blob login-visual__blob--b" />
        <span className="login-visual__blob login-visual__blob--c" />


        <p className="login-visual__quote">
          A calmer way to <span>focus</span>. One small step at a time.
        </p>
      </aside>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29A7.21 7.21 0 0 1 4.88 12c0-.8.14-1.57.39-2.29V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.18 15.24 0 12 0A12 12 0 0 0 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

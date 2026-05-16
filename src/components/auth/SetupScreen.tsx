import { useState, FormEvent } from 'react';
import './LoginScreen.css'; // Reuse auth layout styles

type SetupScreenProps = {
  onSetupComplete: () => void;
};

export function SetupScreen({ onSetupComplete }: SetupScreenProps) {
  const [goal, setGoal] = useState('');
  const [challenge, setChallenge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Simulate/call backend api for user profile setup
      // Example: await authApi.setupProfile({ goal, challenge });
      
      // For now, delay to showcase the flow
      await new Promise((res) => setTimeout(res, 800));
      
      onSetupComplete();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to save setup data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <section className="login-form-wrap">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <header className="login-form__header">
            <h1>Personalize Your Coach</h1>
            <p>Tell us a bit about your focus style.</p>
          </header>

          {errorMsg && <div className="login-error-msg" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{errorMsg}</div>}

          <div className="login-field">
            <label htmlFor="setup-goal">What's your primary goal?</label>
            <div className="login-field__control">
              <input
                id="setup-goal"
                type="text"
                placeholder="e.g. Study for finals, build an app"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="setup-challenge">What's your biggest focus challenge?</label>
            <div className="login-field__control">
              <input
                id="setup-challenge"
                type="text"
                placeholder="e.g. Procrastination, getting distracted"
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-primary" disabled={isLoading}>
            {isLoading ? <span className="login-spinner" /> : 'Complete Setup'}
          </button>
        </form>
      </section>

      <aside className="login-visual" aria-hidden="true">
        <span className="login-visual__blob login-visual__blob--a" />
        <span className="login-visual__blob login-visual__blob--b" />
        <span className="login-visual__blob login-visual__blob--c" />

        <div className="login-visual__brand">
          <img
            src="/assets/logo.png"
            alt="Dopamine Coach logo"
            className="login-visual__brand-mark"
          />
          Dopamine Coach
        </div>

        <p className="login-visual__quote">
          Almost there. We're tailoring your <span>experience</span>.
        </p>
      </aside>
    </div>
  );
}

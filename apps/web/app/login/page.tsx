
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Unable to sign in. Please try again.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <div className="login-brand">
            <div className="login-brand-mark">
              <Boxes size={25} />
            </div>
            <div>
              <div className="login-brand-name">Unified-CS</div>
              <div className="login-brand-caption">Enterprise Suite</div>
            </div>
          </div>

          <div className="login-brand-message">
            <span className="login-eyebrow">UNIFIED CONTROL SYSTEM</span>
            <h1>One workspace.<br />Complete control.</h1>
            <p>
              Bring your people, operations, and business processes together
              in one connected enterprise platform.
            </p>
          </div>

          <div className="login-brand-footer">
            Secure enterprise resource planning
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-container">
          <div className="login-mobile-brand">
            <div className="login-brand-mark">
              <Boxes size={23} />
            </div>
            <span>Unified-CS</span>
          </div>

          <div className="login-heading">
            <h2>Welcome back</h2>
            <p>Enter your credentials to access your workspace.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <div className="login-input-wrap">
                <Mail size={17} />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="password">Password</label>
              </div>

              <div className="login-input-wrap">
                <LockKeyhole size={17} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle size={17} className="login-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="login-security-note">
            Your connection is protected by secure authentication.
          </p>
        </div>

        <div className="login-copyright">
          © {new Date().getFullYear()} Unified-CS. All rights reserved.
        </div>
      </section>
    </main>
  );
}

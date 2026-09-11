import React, { useState } from 'react';
import { useRouter } from '../routes';
import { Sparkles, ArrowRight, Github, Mail, Lock, User } from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const { navigate } = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login/signup, navigate to dashboard
    navigate({ type: 'dashboard' });
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0b] flex overflow-hidden">
      {/* Left Panel: Branding / Visual */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-[#131313] to-[#0a0a0b] border-r border-[#2d2d32] relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#0d99ff] opacity-10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#6001d1] opacity-10 blur-[100px] rounded-full pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0d99ff] to-[#6001d1] flex items-center justify-center shadow-lg shadow-[#0d99ff]/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">zlab.</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-semibold text-[#e5e2e1] leading-tight mb-4">
            Design, Prototype, and Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d99ff] to-[#6001d1]">Faster</span>.
          </h1>
          <p className="text-[#89919e] text-lg leading-relaxed">
            Join the next generation of visual development. Bring your ideas to life with professional-grade tools in your browser.
          </p>
        </div>

        {/* Footer / Social Proof */}
        <div className="relative z-10 text-[#89919e] text-sm">
          <p>© {new Date().getFullYear()} zlab. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#131313]">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0d99ff] to-[#6001d1] flex items-center justify-center shadow-lg shadow-[#0d99ff]/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">zlab.</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-[#e5e2e1] mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-[#89919e] text-sm">
              {mode === 'login'
                ? 'Enter your details to access your workspace.'
                : 'Get started with zlab for free today.'}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] border border-[#353534] hover:border-[#4a4a4a] px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              <Github className="w-4 h-4" />
              Continue with GitHub
            </button>
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] border border-[#353534] hover:border-[#4a4a4a] px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#353534]" />
            <span className="text-[#89919e] text-xs uppercase tracking-wider font-medium">Or</span>
            <div className="flex-1 h-px bg-[#353534]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#bfc7d5]">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#89919e]" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full bg-[#0a0a0b] border border-[#353534] focus:border-[#0d99ff] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#e5e2e1] outline-none transition-colors placeholder-[#4a4a4a]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#bfc7d5]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#89919e]" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-[#0a0a0b] border border-[#353534] focus:border-[#0d99ff] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#e5e2e1] outline-none transition-colors placeholder-[#4a4a4a]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#bfc7d5]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#89919e]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0b] border border-[#353534] focus:border-[#0d99ff] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#e5e2e1] outline-none transition-colors placeholder-[#4a4a4a]"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-[#0d99ff] hover:text-[#9fcaff] transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#0d99ff] hover:bg-[#3fb1ff] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#89919e]">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    navigate({ type: 'signup' });
                  }}
                  className="text-[#0d99ff] hover:text-[#9fcaff] font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    navigate({ type: 'login' });
                  }}
                  className="text-[#0d99ff] hover:text-[#9fcaff] font-medium transition-colors"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

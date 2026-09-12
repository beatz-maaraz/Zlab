import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from '../routes';
import {
  Sparkles,
  ArrowRight,
  Github,
  Mail,
  Lock,
  User,
  Check,
  CheckCircle2,
  Loader2,
  RefreshCw,
  PartyPopper,
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';

interface AuthViewProps {
  initialMode?: 'login' | 'signup' | 'forgot-password' | 'verify-email';
}

const CONFETTI_PARTICLES = Array.from({ length: 16 }).map((_, i) => {
  const angle = (i / 16) * 360;
  const radius = 65 + (i % 3) * 25;
  const rad = (angle * Math.PI) / 180;
  const x = Math.round(Math.cos(rad) * radius);
  const y = Math.round(Math.sin(rad) * radius);
  const colors = ['#0d99ff', '#6001d1', '#34d399', '#f59e0b', '#ec4899', '#38bdf8'];
  const color = colors[i % colors.length];
  const size = 5 + (i % 3) * 2;
  return { id: i, x, y, color, size, rot: (i * 45) % 360 };
});

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password' | 'verify-email'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);

  const { navigate } = useRouter();
  const { setAuthenticated } = useUIStore();

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '', text: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-400', text: 'text-amber-400' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-400', text: 'text-emerald-400' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (mode === 'signup') {
      setIsSubmitting(true);
      // Snappy and fluid animated signup transition sequence
      setTimeout(() => {
        setIsSubmitting(false);
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          setMode('verify-email');
          navigate({ type: 'verify-email' });
        }, 900);
      }, 550);
    } else if (mode === 'login') {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setAuthenticated(true);
        navigate({ type: 'dashboard' });
      }, 400);
    } else if (mode === 'forgot-password') {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setMode('login');
        navigate({ type: 'login' });
      }, 500);
    }
  };

  const handleResendVerification = () => {
    if (isResending || resentSuccess) return;
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setResentSuccess(true);
      setTimeout(() => setResentSuccess(false), 2500);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0b] flex overflow-hidden">
      {/* Left Panel: Branding / Visual */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-[#131313] to-[#0a0a0b] border-r border-[#2d2d32] relative overflow-hidden">
        {/* Floating Ambient Glow Elements - GPU accelerated */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            x: [0, 15, 0],
            y: [0, -10, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#0d99ff] opacity-15 blur-[80px] rounded-full pointer-events-none transform-gpu will-change-transform"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -15, 0],
            y: [0, 12, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#6001d1] opacity-15 blur-[80px] rounded-full pointer-events-none transform-gpu will-change-transform"
        />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0d99ff] to-[#6001d1] flex items-center justify-center shadow-lg shadow-[#0d99ff]/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">zlab.</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0d99ff]/15 text-[#9fcaff] border border-[#0d99ff]/30 font-medium">
            Studio
          </span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-semibold text-[#e5e2e1] leading-tight mb-4"
          >
            Design, Prototype, and Build{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d99ff] via-[#8bbaff] to-[#a855f7]">
              Faster
            </span>
            .
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[#89919e] text-base leading-relaxed mb-6"
          >
            Join the next generation of visual development. Bring your ideas to life with professional-grade tools in your browser.
          </motion.p>

          {/* Feature Badge Strip */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-[#201f1f]/80 border border-[#353534] text-[11px] font-medium text-[#bfc7d5] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
              Real-time Canvas
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#201f1f]/80 border border-[#353534] text-[11px] font-medium text-[#bfc7d5] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d99ff]" />
              Smart Prototype
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#201f1f]/80 border border-[#353534] text-[11px] font-medium text-[#bfc7d5] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
              Team Cloud Sync
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[#89919e] text-xs flex items-center justify-between">
          <p>© {new Date().getFullYear()} zlab. All rights reserved.</p>
          <span className="text-[11px] text-[#555]">v1.0 • Web Canvas</span>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[#131313] relative overflow-hidden">
        {/* Celebration Confetti Overlay on Signup - GPU Accelerated */}
        <AnimatePresence>
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
              {/* Confetti Particles */}
              {CONFETTI_PARTICLES.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    x: p.x,
                    y: p.y,
                    scale: [0, 1.15, 0.9],
                    opacity: [1, 1, 0],
                    rotate: p.rot,
                  }}
                  transition={{
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                    delay: p.id * 0.012,
                  }}
                  style={{
                    backgroundColor: p.color,
                    width: p.size,
                    height: p.size,
                  }}
                  className="absolute rounded-full shadow-md pointer-events-none transform-gpu will-change-[transform,opacity]"
                />
              ))}

              {/* Celebration Toast Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26, mass: 0.8 }}
                className="bg-[#1c1b1b] border border-[#0d99ff]/40 shadow-2xl shadow-[#0d99ff]/20 px-6 py-5 rounded-2xl text-center max-w-xs z-50 backdrop-blur-md transform-gpu will-change-[transform,opacity]"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1 flex items-center justify-center gap-1.5">
                  <PartyPopper className="w-4 h-4 text-[#f59e0b]" />
                  Account Created!
                </h3>
                <p className="text-xs text-[#89919e] mb-3">
                  Preparing verification email...
                </p>
                {/* Progress bar */}
                <div className="w-full h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-[#0d99ff] to-[#34d399] transform-gpu will-change-[width]"
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0d99ff] to-[#6001d1] flex items-center justify-center shadow-lg shadow-[#0d99ff]/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">zlab.</span>
          </div>

          <motion.div
            key={`header-${mode}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-8 transform-gpu will-change-[transform,opacity]"
          >
            <h2 className="text-2xl font-semibold text-[#e5e2e1] mb-2 tracking-tight">
              {mode === 'login'
                ? 'Welcome back'
                : mode === 'signup'
                ? 'Create your account'
                : mode === 'forgot-password'
                ? 'Reset your password'
                : 'Check your inbox'}
            </h2>
            <p className="text-[#89919e] text-sm">
              {mode === 'login'
                ? 'Enter your credentials to access your workspace.'
                : mode === 'signup'
                ? 'Get started with zlab for free in seconds.'
                : mode === 'forgot-password'
                ? 'Enter your email and we will send you a reset link.'
                : 'We just sent a verification link to your email address.'}
            </p>
          </motion.div>

          {mode === 'verify-email' ? (
            <motion.div
              key="verify-email-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-center transform-gpu will-change-[transform,opacity]"
            >
              {/* Pulsing Envelope with Radial Ripple Animation */}
              <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.45, 1.8], opacity: [0.4, 0.15, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 rounded-full bg-[#0d99ff]/25 transform-gpu will-change-[transform,opacity]"
                />
                <motion.div
                  animate={{ scale: [1, 1.25, 1.5], opacity: [0.6, 0.25, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-2 rounded-full bg-[#6001d1]/25 transform-gpu will-change-[transform,opacity]"
                />
                <div className="w-16 h-16 bg-gradient-to-br from-[#0d99ff]/20 to-[#6001d1]/20 border border-[#0d99ff]/35 rounded-2xl flex items-center justify-center shadow-lg relative z-10 transform-gpu">
                  <Mail className="w-8 h-8 text-[#0d99ff]" />
                </div>
              </div>

              {email && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201f1f] border border-[#353534] text-xs text-[#bfc7d5] mb-5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-[#0d99ff]" />
                  <span>{email}</span>
                </div>
              )}

              <p className="text-xs text-[#89919e] mb-6 leading-relaxed">
                Click the confirmation link sent to your inbox to activate your account and start designing.
              </p>

              <div className="space-y-3">
                <button
                  id="btn-resend-verification"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full flex items-center justify-center gap-2 bg-[#201f1f] hover:bg-[#282828] text-[#bfc7d5] hover:text-white border border-[#353534] px-4 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0d99ff]" />
                      <span>Resending...</span>
                    </>
                  ) : resentSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Link Resent!</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-[#89919e]" />
                      <span>Didn't receive email? Resend</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-return-login"
                  onClick={() => {
                    setMode('login');
                    navigate({ type: 'login' });
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#0d99ff] hover:bg-[#3fb1ff] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
                >
                  <span>Proceed to Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {(mode === 'login' || mode === 'signup') && (
                <>
                  <div className="space-y-3 mb-6">
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e as any)}
                      className="w-full flex items-center justify-center gap-2.5 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] border border-[#353534] hover:border-[#4a4a4a] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors group cursor-pointer"
                    >
                      <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Continue with GitHub</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e as any)}
                      className="w-full flex items-center justify-center gap-2.5 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] border border-[#353534] hover:border-[#4a4a4a] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors group cursor-pointer"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
                      <span>Continue with Google</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-[#353534]" />
                    <span className="text-[#89919e] text-xs uppercase tracking-wider font-medium">Or</span>
                    <div className="flex-1 h-px bg-[#353534]" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Smooth GPU Animated Full Name Field for Signup */}
                <AnimatePresence initial={false}>
                  {mode === 'signup' && (
                    <motion.div
                      key="fullname-input-group"
                      initial={{ opacity: 0, height: 0, scale: 0.98 }}
                      animate={{ opacity: 1, height: 68, scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden space-y-1.5 transform-gpu will-change-[height,opacity,transform]"
                    >
                      <label className="text-xs font-medium text-[#bfc7d5]">Full Name</label>
                      <div className="relative group">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#89919e] group-focus-within:text-[#0d99ff] transition-colors" />
                        <input
                          id="input-signup-name"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full bg-[#0a0a0b] border border-[#353534] focus:border-[#0d99ff] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#e5e2e1] outline-none transition-colors placeholder-[#4a4a4a] focus:ring-1 focus:ring-[#0d99ff]/30"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#bfc7d5]">Email Address</label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#89919e] group-focus-within:text-[#0d99ff] transition-colors" />
                    <input
                      id="input-auth-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#0a0a0b] border border-[#353534] focus:border-[#0d99ff] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#e5e2e1] outline-none transition-colors placeholder-[#4a4a4a] focus:ring-1 focus:ring-[#0d99ff]/30"
                    />
                  </div>
                </div>

                {/* Password Field */}
                {mode !== 'forgot-password' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#bfc7d5]">Password</label>
                    <div className="relative group">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#89919e] group-focus-within:text-[#0d99ff] transition-colors" />
                      <input
                        id="input-auth-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0a0a0b] border border-[#353534] focus:border-[#0d99ff] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#e5e2e1] outline-none transition-colors placeholder-[#4a4a4a] focus:ring-1 focus:ring-[#0d99ff]/30"
                      />
                    </div>

                    {/* Smooth Password Strength Meter for Signup */}
                    <AnimatePresence initial={false}>
                      {mode === 'signup' && password.length > 0 && (
                        <motion.div
                          key="password-meter"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 26 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden pt-1.5 space-y-1 transform-gpu will-change-[height,opacity]"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-[#89919e]">Password strength</span>
                            <span className={`font-medium ${passwordStrength.text}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 h-1">
                            {[1, 2, 3].map((step) => (
                              <div
                                key={step}
                                className={`h-full rounded-full transition-colors duration-250 ease-out ${
                                  passwordStrength.score >= step
                                    ? passwordStrength.color
                                    : 'bg-[#2a2a2a]'
                                }`}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        navigate({ type: 'forgot-password' });
                      }}
                      className="text-xs text-[#0d99ff] hover:text-[#9fcaff] transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button with Loading & Creation Animation */}
                <motion.button
                  id="btn-auth-submit"
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.008 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.985 } : {}}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md cursor-pointer transform-gpu will-change-transform ${
                    isSubmitting
                      ? 'bg-[#0b85e0] text-white opacity-95 cursor-wait'
                      : 'bg-[#0d99ff] hover:bg-[#3fb1ff] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {mode === 'signup'
                          ? 'Creating your workspace...'
                          : mode === 'login'
                          ? 'Signing in...'
                          : 'Sending link...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === 'login'
                          ? 'Sign In'
                          : mode === 'signup'
                          ? 'Create Account'
                          : 'Send Reset Link'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Toggle Mode Footer */}
              <div className="mt-8 text-center text-sm text-[#89919e]">
                {mode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      id="btn-switch-signup"
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        navigate({ type: 'signup' });
                      }}
                      className="text-[#0d99ff] hover:text-[#9fcaff] font-medium transition-colors cursor-pointer"
                    >
                      Sign up
                    </button>
                  </p>
                ) : mode === 'signup' ? (
                  <p>
                    Already have an account?{' '}
                    <button
                      id="btn-switch-login"
                      type="button"
                      onClick={() => {
                        setMode('login');
                        navigate({ type: 'login' });
                      }}
                      className="text-[#0d99ff] hover:text-[#9fcaff] font-medium transition-colors cursor-pointer"
                    >
                      Log in
                    </button>
                  </p>
                ) : (
                  <p>
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        navigate({ type: 'login' });
                      }}
                      className="text-[#0d99ff] hover:text-[#9fcaff] font-medium transition-colors cursor-pointer"
                    >
                      Back to login
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

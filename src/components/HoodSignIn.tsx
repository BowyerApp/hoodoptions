"use client";

import { FormEvent, useState } from "react";
import {
  useLogin,
  useLoginWithEmail,
  usePrivy,
} from "@privy-io/react-auth";
import { LogoMark } from "@/components/Brand";

export function HoodSignIn() {
  const [open, setOpen] = useState(false);
  const { authenticated, user, logout } = usePrivy();

  if (authenticated) {
    const email = user?.email?.address;
    return (
      <button
        className="hidden sm:inline-flex items-center rounded-sm border border-border-strong px-3 py-1.5 font-mono text-[12px] text-muted transition-colors hover:text-text"
        onClick={() => logout()}
      >
        {email ? email.split("@")[0] : "Sign out"}
      </button>
    );
  }

  return (
    <>
      <button
        data-cursor
        className="hidden sm:inline-flex items-center rounded-sm border border-border-strong px-3 py-1.5 text-[12px] font-medium text-text transition-colors hover:bg-surface"
        onClick={() => setOpen(true)}
      >
        Sign in
      </button>
      {open && <HoodSignInModal onClose={() => setOpen(false)} />}
    </>
  );
}

function HoodSignInModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { sendCode, loginWithCode, state } = useLoginWithEmail({
    onComplete: () => onClose(),
    onError: (error) => setMessage(String(error) || "Unable to sign in."),
  });
  const { login } = useLogin({
    onComplete: () => onClose(),
    onError: (error) => setMessage(String(error) || "Wallet sign-in failed."),
  });

  const continueWithEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setMessage("Enter a valid email address.");
      return;
    }
    setMessage(null);
    try {
      await sendCode({ email });
      setSent(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send code.");
    }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    if (code.trim().length < 6) {
      setMessage("Enter the six-digit code.");
      return;
    }
    setMessage(null);
    try {
      await loginWithCode({ code: code.trim() });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invalid code.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/20 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to HoodOptions"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div className="relative w-full max-w-[470px] rounded-xl bg-[#fcfbf8] p-6 text-[#161616] shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-xl text-black/45 transition-colors hover:bg-black/[0.08]"
          aria-label="Close sign in"
        >
          ×
        </button>

        <div className="mx-auto mt-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#121212]">
          <LogoMark size={30} className="text-[#f3f5f7]" />
        </div>
        <h2 className="mt-5 text-center text-[22px] font-semibold tracking-tight">
          {sent ? "Check your inbox" : "Sign in to HoodOptions"}
        </h2>
        <p className="mt-2 text-center text-sm text-black/50">
          {sent
            ? `We sent a verification code to ${email}.`
            : "Trade tokenized markets with your email or wallet."}
        </p>

        {!sent ? (
          <form className="mt-7" onSubmit={continueWithEmail}>
            <input
              autoFocus
              type="email"
              inputMode="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-13 w-full rounded-lg border border-black/15 bg-white px-4 text-[16px] outline-none placeholder:text-black/30 focus:border-black/45"
            />
            <button
              disabled={state.status === "sending-code"}
              className="mt-3 h-13 w-full rounded-lg bg-[#191919] text-[16px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {state.status === "sending-code" ? "Sending…" : "Continue"}
            </button>
          </form>
        ) : (
          <form className="mt-7" onSubmit={verifyCode}>
            <input
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter verification code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-13 w-full rounded-lg border border-black/15 bg-white px-4 text-center font-mono text-lg tracking-[0.35em] outline-none placeholder:tracking-normal placeholder:text-black/30 focus:border-black/45"
            />
            <button
              disabled={state.status === "submitting-code"}
              className="mt-3 h-13 w-full rounded-lg bg-[#191919] text-[16px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {state.status === "submitting-code" ? "Verifying…" : "Verify & continue"}
            </button>
            <button
              type="button"
              className="mt-3 w-full text-sm text-black/50 underline underline-offset-4"
              onClick={() => {
                setSent(false);
                setCode("");
                setMessage(null);
              }}
            >
              Use another email
            </button>
          </form>
        )}

        {!sent && (
          <>
            <div className="my-6 flex items-center gap-3 text-[11px] font-medium tracking-[0.12em] text-black/35">
              <span className="h-px flex-1 bg-black/10" />
              OR
              <span className="h-px flex-1 bg-black/10" />
            </div>
            <button
              onClick={() => login({ loginMethods: ["wallet"], walletChainType: "ethereum-only" })}
              className="h-13 w-full rounded-lg border border-black/15 bg-white text-[16px] font-medium transition-colors hover:bg-black/[0.025]"
            >
              Continue with wallet
            </button>
          </>
        )}

        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
        <p className="mt-6 text-center text-xs leading-relaxed text-black/40">
          By continuing, you agree to HoodOptions&apos; Terms of Service and
          Privacy Policy.
          <br />
          <span className="mt-3 inline-block font-medium text-black/50">Secured by Privy</span>
        </p>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineEmail, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { auth, googleProvider } from "../utils/FireBase";
import { userRegister, sendOtp, verifyOtp } from "../Hooks/AuthHooks";
import { setUser } from "../slice/authSlice";
import type { AppDispatch } from "../store/store";
import StatusMessage from "../Components/StatusMessage";
import { getErrorMessage } from "../utils/errorMessage";


// STEP TYPE
type Step = "login" | "otp";


function SignUp() {

  const navigate  = useNavigate();
  const dispatch  = useDispatch<AppDispatch>();

  const [step,    setStep]    = useState<Step>("login");
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  // OTP INPUT REFS — for auto-focus
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);


  // ─── AUTO-FOCUS FIRST OTP BOX WHEN STEP CHANGES ──────────────────────────
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);


  // ─── GOOGLE LOGIN ─────────────────────────────────────────────────────────
  const googleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const result        = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();
      const res           = await userRegister({ firebaseToken });

      dispatch(setUser({
        id:          String(res.user.id),
        email:       res.user.email,
        userName:    res.user.userName,
        photoURL:    res.user.photoURL,
        phoneNumber: res.user.phoneNumber,
      }));

      navigate("/");

    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Google authentication failed. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };


  // ─── SEND OTP ─────────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError("");

      await sendOtp(email.trim());

      setSuccess("OTP sent! Check your inbox.");
      setStep("otp");

    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to send OTP. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };


  // ─── OTP INPUT HANDLERS ───────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;           // digits only

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    // auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };


  // ─── VERIFY OTP ───────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await verifyOtp(email.trim(), code);

      dispatch(setUser({
        id:          String(res.user.id),
        email:       res.user.email,
        userName:    res.user.userName,
        photoURL:    res.user.photoURL,
        phoneNumber: res.user.phoneNumber,
      }));

      navigate("/");

    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Invalid or expired OTP. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };


  // ─── RESEND OTP ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    try {
      setError("");
      setSuccess("");
      setOtp(Array(6).fill(""));
      await sendOtp(email.trim());
      setSuccess("New OTP sent!");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to resend OTP."
        )
      );
    }
  };


  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── CARD ── */}
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        padding: "2.5rem 2rem",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Decorative glow */}
        <div style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "220px",
          height: "220px",
          background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* ── BACK BUTTON (OTP step) ── */}
        {step === "otp" && (
          <button
            onClick={() => {
              setStep("login");
              setError("");
              setSuccess("");
              setOtp(Array(6).fill(""));
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.85rem",
              cursor: "pointer",
              marginBottom: "1.5rem",
              padding: 0,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          >
            <MdArrowBack size={16} /> Back
          </button>
        )}


        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#fff",
            margin: 0,
          }}>
            {step === "login" && "Login"}
            {step === "otp"    && "Enter OTP"}
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.45)",
            marginTop: "0.6rem",
            fontSize: "0.92rem",
          }}>
            {step === "login" && "Continue with Google or get a one-time email code"}
            {step === "otp"    && `Code sent to ${email}`}
          </p>
        </div>


        {/* ══════════════════════════════════════════
            STEP: LOGIN
        ══════════════════════════════════════════ */}
        {step === "login" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Google */}
            <button
              id="btn-google-login"
              onClick={googleLogin}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: "#fff",
                border: "none",
                color: "#111",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#f1f1f1"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
            >
              <FcGoogle size={22} />
              {loading ? "Signing in..." : "Continue with Google"}
            </button>

            {/* Divider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "0.25rem 0",
            }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            </div>

            <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              <div>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                }}>
                  <MdOutlineEmail size={18} />
                  Email address
                </label>
                <input
                  id="input-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: "1rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.7)")}
                  onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
              </div>

              <button
                id="btn-send-otp"
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading || !email.trim() ? 0.6 : 1,
                  transition: "opacity 0.2s, transform 0.15s",
                }}
                onMouseEnter={e => { if (!loading && email.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

            </form>

          </div>
        )}


        {/* ══════════════════════════════════════════
            STEP: OTP
        ══════════════════════════════════════════ */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* 6 digit boxes */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-digit-${i}`}
                  ref={el => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  style={{
                    width: "48px",
                    height: "56px",
                    textAlign: "center",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    borderRadius: "12px",
                    background: digit
                      ? "rgba(99,102,241,0.2)"
                      : "rgba(255,255,255,0.06)",
                    border: digit
                      ? "2px solid rgba(99,102,241,0.8)"
                      : "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    outline: "none",
                    transition: "border-color 0.2s, background 0.2s",
                    caretColor: "#6366f1",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.9)")}
                  onBlur={e  => (e.target.style.borderColor = digit ? "rgba(99,102,241,0.8)" : "rgba(255,255,255,0.15)")}
                />
              ))}
            </div>

            <button
              id="btn-verify-otp"
              type="submit"
              disabled={loading || otp.join("").length < 6}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading || otp.join("").length < 6 ? 0.6 : 1,
                transition: "opacity 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => {
                if (!loading && otp.join("").length === 6)
                  e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {/* Resend */}
            <p style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.85rem",
              margin: 0,
            }}>
              Didn't receive it?{" "}
              <button
                type="button"
                id="btn-resend-otp"
                onClick={handleResend}
                style={{
                  background: "none",
                  border: "none",
                  color: "#a5b4fc",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Resend OTP
              </button>
            </p>

          </form>
        )}


        {/* ── ERROR / SUCCESS ── */}
        {error && (
          <StatusMessage
            type="error"
            message={error}
          />
        )}

        {success && !error && (
          <StatusMessage
            type="success"
            message={success}
          />
        )}

      </div>
    </div>
  );
}

export default SignUp;

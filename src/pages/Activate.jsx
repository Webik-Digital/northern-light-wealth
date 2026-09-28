import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { setPassword as savePassword } from "@/api/auth";
import { getSession } from "@/api/auth";

// Choosing a password, for someone arriving from an emailed link.
//
// This used to ask for an email, register an account, then verify a six-digit
// code. None of that applies now, and losing it is the point: an account is not
// created here. It already exists, because an admin made it, and the link in the
// email carries a session that proves the person opening it reads that mailbox.
// So the only thing left to ask for is the password.
//
// The session is recovered from the URL by the Supabase client on load, which is
// why there is nothing here that reads a token by hand.
export default function Activate() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(null); // null while we look for the session
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    // Give the client a moment to pick the session out of the URL fragment.
    const timer = setTimeout(async () => {
      const session = await getSession();
      if (active) setReady(Boolean(session));
    }, 400);
    return () => { active = false; clearTimeout(timer); };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use at least eight characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Those two passwords are not the same.");
      return;
    }

    setLoading(true);
    try {
      await savePassword(password);
      navigate("/resources");
    } catch (err) {
      setError(err.message || "That password could not be saved.");
    } finally {
      setLoading(false);
    }
  };

  // An expired or already-used link is the common case here, and saying so
  // plainly is more use than a generic failure once they have typed a password.
  if (ready === false) {
    return (
      <AuthLayout
        title="This link has expired"
        subtitle="Invitation and reset links can only be used once, and not indefinitely."
      >
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--ink-soft)" }}>
          Ask us for a fresh one, or request it yourself and we will send another.
        </p>
        <div style={{ marginTop: 20, display: "flex", gap: 14, alignItems: "center" }}>
          <Link to="/forgot-password"><Button type="button">Send me a new link</Button></Link>
          <Link to="/login" style={{ fontSize: 14 }}>Back to sign in</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose your password"
      subtitle="This is the password you will use to open the client library."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
            <Input
              id="password"
              type="password"
              className="pl-9"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least eight characters"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
            <Input
              id="confirmPassword"
              type="password"
              className="pl-9"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p style={{ fontSize: 14, color: "var(--plum)" }}>{error}</p>}

        <Button type="submit" className="w-full" disabled={loading || ready === null}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save password and continue"}
        </Button>
      </form>
    </AuthLayout>
  );
}

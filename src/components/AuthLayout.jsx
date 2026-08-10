import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/nlw-logo.png";

// Shared shell for the sign-in, sign-up and password pages. Kept in the site's
// own voice rather than the scaffold's, so arriving here does not feel like
// leaving the firm's site.
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="nlw-auth">
      <div className="nlw-auth-inner">
        <Link to="/" className="nlw-auth-mark" aria-label="Northern Light Wealth home">
          <img src={logo} alt="Northern Light Wealth" />
        </Link>

        <div className="nlw-auth-card">
          <h1 className="nlw-h3">{title}</h1>
          {subtitle && <p className="nlw-auth-sub">{subtitle}</p>}
          <div className="nlw-auth-body">{children}</div>
        </div>

        {footer && <p className="nlw-auth-foot">{footer}</p>}
        <Link to="/" className="nlw-link-more nlw-auth-back">
          Back to the site <span className="arw">→</span>
        </Link>
      </div>
    </div>
  );
}

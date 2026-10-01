import type { Metadata } from "next";
import "./globals.css";
import "./quicklinks.css";
import "./hero-overrides.css";
import "./certificate.css";
import "./certificate-modern.css";
import "./footer-overrides.css";
import "./portal-shell.css";
import "./staff/staff-dashboard.css";
import "./staff/login/staff-login.css";

export const metadata: Metadata = {
  title: "FPIS Certificate Portal",
  description: "Federal Produce Inspection Service certificate generation and review portal.",
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="portal-header">
          <div className="portal-brand" aria-label="Federal Produce Inspection Service">
            <img src="/images/fpis-logo.png" alt="" />
            <span><strong>FPIS</strong><small>Federal Produce Inspection Service</small></span>
          </div>
          <div className="portal-header-status"><span className="portal-status-dot" /> CERTIFICATE PORTAL</div>
        </header>
        <main>{children}</main>
        <footer className="portal-footer">
          <span>Federal Produce Inspection Service</span>
          <span>Federal Ministry of Industry, Trade &amp; Investment</span>
          <span>Secure certificate operations</span>
        </footer>
      </body>
    </html>
  )
}

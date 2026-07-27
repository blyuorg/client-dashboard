import { AuthBackground } from "@/components/auth/auth-background";
import { BrandingPanel } from "@/components/auth/branding-panel";
import { BlyuLogo } from "@/components/auth/blyu-logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[60%_40%]">
      <AuthBackground />

      <div className="relative hidden lg:block">
        <BrandingPanel />
      </div>

      {/* Mobile: a condensed version of the branding panel becomes the top hero. */}
      <div className="relative flex items-center justify-between border-b border-auth-border px-6 py-5 lg:hidden">
        <BlyuLogo markClassName="h-8 w-8 text-sm" className="gap-2" />
        <span className="text-sm font-medium text-auth-muted">Blyu Client Portal</span>
      </div>

      <div className="relative flex min-h-[calc(100vh-70px)] items-center justify-center px-4 py-10 sm:px-8 lg:min-h-screen">
        {children}
      </div>
    </div>
  );
}

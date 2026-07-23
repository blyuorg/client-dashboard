import { BrandingPanel } from "@/components/auth/branding-panel";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-auth-bg lg:grid lg:grid-cols-[45%_55%]">
      <div className="hidden border-r border-auth-border bg-white lg:block">
        <BrandingPanel />
      </div>

      {/* Mobile: a condensed version of the branding panel becomes the top hero. */}
      <div className="flex items-center justify-between border-b border-auth-border bg-white px-6 py-5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-auth-primary text-[15px] font-bold text-white">
          B
        </div>
        <span className="text-sm font-medium text-auth-muted">Blyu Client Portal</span>
      </div>

      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center px-4 py-10 sm:px-8 lg:min-h-screen">
        {children}
      </div>
    </div>
  );
}

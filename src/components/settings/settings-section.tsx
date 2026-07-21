import type { SettingsSectionId } from "@/lib/settings/types";

export function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id: SettingsSectionId;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

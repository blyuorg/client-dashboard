import { ProfileCard } from "@/components/profile/profile-card";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">My Profile</h1>
        <p className="text-sm text-muted-foreground">View your account information and contact details.</p>
      </div>

      <ProfileCard />
    </div>
  );
}

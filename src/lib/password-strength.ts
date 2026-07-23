export type PasswordChecks = {
  length: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
};

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very weak" | "Weak" | "Fair" | "Good" | "Strong";
  checks: PasswordChecks;
};

export function getPasswordStrength(password: string): PasswordStrength {
  const checks: PasswordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const score = (password.length === 0 ? 0 : Math.max(1, passed)) as PasswordStrength["score"];
  const labels: PasswordStrength["label"][] = ["Very weak", "Weak", "Fair", "Good", "Strong"];

  return { score, label: labels[score], checks };
}

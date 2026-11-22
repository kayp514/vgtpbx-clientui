import { SignIn } from "@tern-secure/nextjs";

export const instant = false

export default function SignInPage() {
  return (
    <SignIn
      appearance={{ layout: { socialButtonsPlacement: "top" } }}
      socialProviders={[{ name: "google", options: { mode: "popup" } }]}
    />
  );
}

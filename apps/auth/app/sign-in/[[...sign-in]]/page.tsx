import { SignIn } from "@tern-secure/nextjs";

export const instant = false

export default function SignInPage() {
  return (
    <SignIn
      appearance={{ layout: { socialButtonsPlacement: "top" } }}
      routing="path"
      path="/sign-in"
      socialProviders={[{ name: "google", options: { mode: "popup" } }]}
    />
  );
}

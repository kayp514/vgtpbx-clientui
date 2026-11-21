import { SignUp } from "@tern-secure/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{ layout: { socialButtonsPlacement: "top" } }}
      socialProviders={[{ name: "google", options: { mode: "popup" } }]}
    />
  );
}

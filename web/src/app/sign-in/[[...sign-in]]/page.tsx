import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EE]">
      <SignIn
        appearance={{
          elements: {
            card: "shadow-xl border border-[#D4A96A]",
            headerTitle: "font-display text-[#8B1A1A]",
            formButtonPrimary: "bg-[#8B1A1A] hover:bg-[#6d1414]",
          },
        }}
      />
    </div>
  );
}

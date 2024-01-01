"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function DashboardButton() {
  const user = useUser();
  const router = useRouter();

  return (
    <Button
      onClick={() => {
        // redirect to dashboard
        // clerk implicitly redirects to login if not signed in
        router.push("/dashboard");
      }}
    >
      {user.isSignedIn ? "Dashboard" : "Login"}{" "}
    </Button>
  );
}

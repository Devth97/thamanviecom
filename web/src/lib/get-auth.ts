import { auth, currentUser } from "@clerk/nextjs/server";

export async function getAuthUser(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getFullUser() {
  return currentUser();
}

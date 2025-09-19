// src/lib/admin.ts
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { col } from "@/lib/db";

function emailInEnvAdmins(email?: string | null) {
    if (!email) return false;
    const list = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    return list.includes(email.toLowerCase());
}

export async function requireAdmin() {
    const session = await auth();
    const email = session?.user?.email?.toLowerCase();
    if (!email) redirect(`/signin?callbackUrl=${encodeURIComponent("/admin")}`);

    const users = await col("users");
    const u = await users.findOne<{ isAdmin?: boolean; _id: any }>({ email });
    const isAdmin = !!u?.isAdmin || emailInEnvAdmins(email);

    if (!isAdmin) notFound(); // 404 for non-admins
    return { userId: (session!.user as any).id as string, email, dbUserId: u?._id };
}

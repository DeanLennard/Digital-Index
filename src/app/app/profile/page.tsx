// src/app/app/profile/page.tsx
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getOrgContext } from "@/lib/access";
import { col } from "@/lib/db";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) redirect("/signin?callbackUrl=/app/profile");

    const { orgId } = await getOrgContext();
    if (!orgId) {
        // No org chosen yet — nudge to create one
        return (
            <div className="mx-auto max-w-3xl p-6">
                <h1 className="text-2xl font-semibold text-[var(--navy)]">Your organisation</h1>
                <p className="mt-2 text-sm text-gray-700">
                    You’re not in an organisation yet. Create one to get started.
                </p>
                <a
                    href="/app/onboarding?noredir=1"
                    className="mt-4 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                >
                    Create new organisation
                </a>
            </div>
        );
    }

    const orgs = await col("orgs");
    const org = await orgs.findOne(
        { _id: new ObjectId(orgId) },
        { projection: { name: 1, sector: 1, sizeBand: 1, ch: 1 } }
    );

    if (!org) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <h1 className="text-2xl font-semibold text-[var(--navy)]">Your organisation</h1>
                <p className="mt-2 text-sm text-gray-700">We couldn’t find that organisation.</p>
                <a
                    href="/app/onboarding?noredir=1"
                    className="mt-4 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90"
                >
                    Create new organisation
                </a>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="text-2xl font-semibold text-[var(--navy)]">Organisation profile</h1>
            <p className="mt-1 text-sm text-gray-700">
                Update your current organisation’s details. You can also create an additional org if you need.
            </p>

            <div className="mt-6">
                <ProfileForm
                    initialOrg={{
                        id: String(org._id),
                        name: org.name ?? "",
                        sector: org.sector ?? "",
                        sizeBand: org.sizeBand ?? "",
                        ch: org.ch ?? null, // { companyNumber, name, ... } if present
                    }}
                />
            </div>

            <div className="mt-8">
                <a
                    href="/app/onboarding?noredir=1"
                    className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium border"
                >
                    Create another organisation
                </a>
            </div>
        </div>
    );
}

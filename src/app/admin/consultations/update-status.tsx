// src/app/admin/consultations/update-status.tsx
"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "./actions";

export function UpdateStatus({ id, current }: { id: string; current: "new"|"contacted"|"scheduled"|"closed" }) {
    const [pending, start] = useTransition();

    return (
        <form
            action={(fd) => start(async () => { await updateLeadStatus(id, fd); }) }
        >
            <select
                name="status"
                defaultValue={current}
                className="rounded border px-2 py-1 text-sm"
                disabled={pending}
            >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="scheduled">Scheduled</option>
                <option value="closed">Closed</option>
            </select>
            {pending ? <div className="mt-1 text-xs text-gray-500">Saving…</div> : null}
        </form>
    );
}

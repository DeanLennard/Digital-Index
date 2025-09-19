import { auth } from '@/lib/auth';
import { col } from '@/lib/db';

export async function GET() {
    const session = await auth();
    if (!session?.user) return new Response('Unauthorised', { status: 401 });
    const users = await col('users');
    const doc = await users.findOne({ email: session.user.email });
    return Response.json({ user: { email: doc?.email, orgId: doc?.orgId?.[0], roles: doc?.roles || [] } });
}
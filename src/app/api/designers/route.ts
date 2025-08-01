import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const client = await clerkClient();
  const clerkUsersResponse = await client.users.getUserList({ limit: 100 });
  const clerkUsersList = clerkUsersResponse.data;

  const designers = clerkUsersList
    .filter((user: any) => user.publicMetadata?.role === 'designer')
    .map((user: any) => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses?.[0]?.emailAddress || user.id,
      email: user.emailAddresses?.[0]?.emailAddress || '',
      imageUrl: user.imageUrl || '',
    }));

  return NextResponse.json(designers);
} 
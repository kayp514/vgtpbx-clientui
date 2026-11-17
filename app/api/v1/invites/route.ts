import { NextResponse } from 'next/server';

// This route let the Firebase sign-up function look up a pending
// invitation. That table no longer exists.
// TODO(VGT-30): a pending member is a Firebase user who has not signed in yet.
// TODO(VGT-31): a pending guest is a pbx_users row with status "invited".
export async function GET() {
    return NextResponse.json(
        {
            success: false,
            error: {
                code: 'GONE',
                message: 'Invite lookup through this endpoint has been retired',
            },
        },
        { status: 410 }
    );
}

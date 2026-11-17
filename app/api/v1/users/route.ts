import { NextResponse } from 'next/server'

// This route was called by the Firebase sign-up function to write the old
// auth user table, which no longer exists. Firebase is the only identity store.
// TODO(VGT-30): members are created by the invitation flow (Firebase user in the
// admin's tenant plus a pbx_users row), not through this endpoint.
export async function POST() {
    return NextResponse.json(
        {
            success: false,
            error: {
                code: 'GONE',
                message: 'User creation through this endpoint has been retired'
            }
        },
        { status: 410 }
    )
}

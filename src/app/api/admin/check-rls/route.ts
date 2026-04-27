import { requireSession } from '@/lib/auth/require-session'
import { createAdminClient as createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // Auth check
    const _sessionUser = await requireSession()
    if (!_sessionUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Try to delete a test (this will show RLS issues)
        const { data: testAliquote, error: selectError } = await supabase
            .from('aliquote_iva')
            .select('id')
            .limit(1)

        // Try to check storage policies
        const { data: buckets, error: storageError } = await supabase
            .storage
            .listBuckets()

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email
            },
            aliquote_test: {
                success: !selectError,
                error: selectError?.message,
                count: testAliquote?.length || 0
            },
            storage: {
                success: !storageError,
                error: storageError?.message,
                buckets: buckets?.map(b => b.name) || []
            }
        })
    } catch (error: any) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 })
    }
}

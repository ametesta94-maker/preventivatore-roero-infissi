import { requireSession } from '@/lib/auth/require-session'
import { createAdminClient as createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // Auth check
    const _sessionUser = await requireSession()
    if (!_sessionUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({
                error: 'Tipo file non valido. Usa PNG, JPG o WebP.'
            }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({
                error: 'File troppo grande. Massimo 5MB.'
            }, { status: 400 })
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `categoria_${Date.now()}.${fileExt}`
        const filePath = `categorie/${fileName}`

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('assets')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({
                error: `Errore upload: ${uploadError.message}`
            }, { status: 500 })
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('assets')
            .getPublicUrl(filePath)

        return NextResponse.json({ url: publicUrl })

    } catch (error: any) {
        console.error('Upload failed:', error)
        return NextResponse.json({
            error: error.message || 'Upload failed'
        }, { status: 500 })
    }
}

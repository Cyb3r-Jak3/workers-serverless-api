import { Context } from 'hono'
import * as openpgp from 'openpgp'
import { JSONErrorResponse, HandleCORS } from '@cyb3r-jak3/workers-common'

const RESUME_URL = 'https://cyberjake.xyz/files/resume.pdf'
const RESUME_KEY = 'RESUME_FILE'

export async function EncryptResumeEndpoint(c: Context): Promise<Response> {
    const req = c.req

    // Handle Options
    if (req.method == 'OPTIONS') {
        return HandleCORS(req.raw)
    }
    if (req.method != 'POST') {
        return new Response('Method not allowed', { status: 405 })
    }

    if (req.headers.get('Content-Type') === null) {
        return JSONErrorResponse('Not multipart form request', 400)
    }
    const data = await req.formData()

    const key = data.get('key')
    if (!key || typeof key === 'string') {
        return JSONErrorResponse('Need a key uploaded and there was none', 400)
    }

    const keyText = await key.text()
    const readKey = await openpgp.readKey({ armoredKey: keyText })
    const resumeFile = await GetResume(c)
    const message = await openpgp.createMessage({ binary: resumeFile })
    const encrypted = await openpgp.encrypt({
        message: message,
        encryptionKeys: readKey,
        format: 'armored',
    })
    return new Response(encrypted, {
        headers: {
            'Content-Disposition':
                'attachment; filename=jwhite_signed_resume.pdf.gpg',
            'Content-Type': 'application/octet-stream',
        },
    })
}

async function GetResume(c: Context): Promise<Uint8Array> {
    let resume: ArrayBuffer | null = await c.env.KV.get(RESUME_KEY, {
        type: 'arrayBuffer',
    })
    if (resume) {
        return new Uint8Array(resume)
    }
    const req = await fetch(RESUME_URL)
    resume = await (await req.blob()).arrayBuffer()
    c.executionCtx.waitUntil(c.env.KV.put(RESUME_KEY, resume))
    return new Uint8Array(resume)
}

import { handle } from './logic.js';
Deno.serve((req: Request) => handle(req, {
 SUPABASE_URL:Deno.env.get('SUPABASE_URL'),
 SUPABASE_SERVICE_ROLE_KEY:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
 RESEND_API_KEY:Deno.env.get('RESEND_API_KEY'),
 PASSPORT_EDITORIAL_MAIL_FROM:Deno.env.get('PASSPORT_EDITORIAL_MAIL_FROM')
}));

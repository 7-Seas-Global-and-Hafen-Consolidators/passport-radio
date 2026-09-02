# Minha Passport · Supabase contract

Production account URL: `https://passportradio.online/minha-passport.html`

Authentication code uses this URL for signup confirmation and `?recovery=1` for password recovery. Supabase Authentication URL Configuration must allow this production URL as a redirect destination. The current implementation deliberately preserves the existing single-page `minha-passport.html` architecture rather than introducing a parallel `/conta/` tree.

Account panel reads the authenticated user's rows from `profiles`, `favorites`, and `votes`. Row Level Security remains the database authority: the browser only uses the publishable key and filters account data by the authenticated `user.id`.

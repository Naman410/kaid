
-- Fix NULL values in auth.users that crash GoTrue's schema scan
UPDATE auth.users SET email_change = '' WHERE email_change IS NULL;
UPDATE auth.users SET email_change_token_new = '' WHERE email_change_token_new IS NULL;
UPDATE auth.users SET email_change_token_current = '' WHERE email_change_token_current IS NULL;
UPDATE auth.users SET email_change_confirm_status = 0 WHERE email_change_confirm_status IS NULL;
UPDATE auth.users SET phone_change = '' WHERE phone_change IS NULL;
UPDATE auth.users SET phone_change_token = '' WHERE phone_change_token IS NULL;

-- Also reload the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

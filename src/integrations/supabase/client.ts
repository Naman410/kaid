// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dkmdtuwtvuvekzjyopaj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbWR0dXd0dnV2ZWt6anlvcGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODYyMjEsImV4cCI6MjA2NDI2MjIyMX0.r3ya5-xVjqm9QelHD5r_DhsHYIiXz3loA28oMEuRjvY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
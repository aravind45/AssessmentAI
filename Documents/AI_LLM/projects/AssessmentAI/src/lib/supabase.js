import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://chktzonseacamniddifq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoa3R6b25zZWFjYW1uaWRkaWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTM0OTgsImV4cCI6MjA4MTM4OTQ5OH0.ls993dsdw6Trf_pHVxNyuYceXki7o4hD_TkLF3FQGv4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
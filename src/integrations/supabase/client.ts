import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tvipfzckkbmjcjhxwfqf.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aXBmemNra2JtamNqaHh3ZnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MTU0MTEsImV4cCI6MjA4OTE5MTQxMX0.EDXyeU9MmxYiX6WG67AWYFgy2PkYt46ORVmauXajTro';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isSupabaseConfigured = () => true;

-- Grant necessary permissions to authenticated users for all tables
-- This fixes "permission denied for table" errors

-- Grant usage on public schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions for profiles table (UUID primary key, no sequence)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- Grant permissions for chat_messages table  
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT USAGE ON SEQUENCE public.chat_messages_id_seq TO authenticated;

-- Grant permissions for bookmarks table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
GRANT USAGE ON SEQUENCE public.bookmarks_id_seq TO authenticated;

-- Grant permissions for chat_groups table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_groups TO authenticated;
GRANT USAGE ON SEQUENCE public.chat_groups_id_seq TO authenticated;

-- Grant execute permission on utility functions
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO authenticated; 
-- Step 1: Add chat_group_id column to chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN chat_group_id BIGINT;

-- Step 2: Create default chat groups for existing users who have messages
INSERT INTO public.chat_groups (user_id, title, created_at, updated_at)
SELECT DISTINCT 
    user_id,
    'デフォルトチャット' as title,
    MIN(created_at) as created_at,
    NOW() as updated_at
FROM public.chat_messages 
WHERE user_id IS NOT NULL
GROUP BY user_id;

-- Step 3: Update existing chat_messages to reference the default chat group
UPDATE public.chat_messages 
SET chat_group_id = cg.id
FROM public.chat_groups cg
WHERE public.chat_messages.user_id = cg.user_id
AND cg.title = 'デフォルトチャット';

-- Step 4: Handle AI messages (user_id is NULL)
-- AI messages need to be associated with the most recent user's chat group
-- We'll associate them with the chat group of the immediately preceding user message
WITH ai_message_groups AS (
    SELECT 
        cm.id,
        LAG(cm2.chat_group_id) OVER (ORDER BY cm.created_at) as prev_chat_group_id
    FROM public.chat_messages cm
    LEFT JOIN public.chat_messages cm2 ON cm2.id < cm.id AND cm2.role = 'user'
    WHERE cm.role = 'ai' AND cm.chat_group_id IS NULL
)
UPDATE public.chat_messages 
SET chat_group_id = amg.prev_chat_group_id
FROM ai_message_groups amg
WHERE public.chat_messages.id = amg.id
AND amg.prev_chat_group_id IS NOT NULL;

-- Step 5: Make chat_group_id NOT NULL and add foreign key constraint
ALTER TABLE public.chat_messages 
ALTER COLUMN chat_group_id SET NOT NULL;

ALTER TABLE public.chat_messages 
ADD CONSTRAINT fk_chat_messages_chat_group_id 
FOREIGN KEY (chat_group_id) REFERENCES public.chat_groups(id) ON DELETE CASCADE;

-- Step 6: Update RLS policies for chat_messages (remove old policies first)
DROP POLICY IF EXISTS "Users can view their own messages and AI messages." ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages." ON public.chat_messages;

-- Step 7: Remove user_id column from chat_messages
ALTER TABLE public.chat_messages 
DROP COLUMN user_id;

-- New RLS policies based on chat_group ownership
CREATE POLICY "Users can view messages in their chat groups." ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM public.chat_groups cg 
            WHERE cg.id = chat_messages.chat_group_id 
            AND cg.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their chat groups." ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.chat_groups cg 
            WHERE cg.id = chat_messages.chat_group_id 
            AND cg.user_id = auth.uid()
        )
    );

-- Step 8: Update suggestions RLS policy to work with new structure
DROP POLICY IF EXISTS "Users can view suggestions for accessible messages." ON public.suggestions;

CREATE POLICY "Users can view suggestions for messages in their chat groups." ON public.suggestions
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.chat_messages cm
            JOIN public.chat_groups cg ON cm.chat_group_id = cg.id
            WHERE cm.id = suggestions.chat_message_id
            AND cg.user_id = auth.uid()
        )
    );

-- Step 9: Create index on chat_group_id for better performance
CREATE INDEX idx_chat_messages_chat_group_id ON public.chat_messages (chat_group_id);

-- Step 10: Update table comment
COMMENT ON COLUMN public.chat_messages.chat_group_id IS 'Foreign key to the chat group containing this message.'; 
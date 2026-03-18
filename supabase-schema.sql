-- PawPal MVP 数据库 Schema
-- 在 Supabase SQL Editor 里执行这个文件

-- 宠物表
CREATE TABLE IF NOT EXISTS pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('cat', 'dog', 'bunny')),
  appearance TEXT DEFAULT 'Cream',
  personality_traits JSONB DEFAULT '{}',
  intimacy_level INT DEFAULT 1 CHECK (intimacy_level BETWEEN 1 AND 10),
  mood TEXT DEFAULT 'happy' CHECK (mood IN ('happy', 'neutral', 'missing_you')),
  memory_summary JSONB DEFAULT '{"key_facts": [], "recent_topics": []}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ DEFAULT NOW()
);

-- 对话消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'pet')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 每日消息计数（限流）
CREATE TABLE IF NOT EXISTS daily_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  message_count INT DEFAULT 0,
  UNIQUE (user_id, date)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_pet_id ON messages(pet_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 开启 RLS（行级安全）
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有人都可以操作自己的数据（MVP简化版，后续接入Auth再细化）
CREATE POLICY "Allow all for pets" ON pets FOR ALL USING (true);
CREATE POLICY "Allow all for messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all for daily_usage" ON daily_usage FOR ALL USING (true);

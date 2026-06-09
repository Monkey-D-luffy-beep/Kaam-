-- Subtask scoring system
-- Each task can be broken into subtasks with time estimates, difficulty, and urgency
-- Workload score = (urgency * 0.6) + (difficulty * 0.4)

CREATE TABLE IF NOT EXISTS subtasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 255),
  time_min      DECIMAL(5,1),          -- hours, e.g. 0.5
  time_max      DECIMAL(5,1),          -- hours, e.g. 8.0
  difficulty    SMALLINT DEFAULT 50 CHECK (difficulty BETWEEN 1 AND 100),
  urgency       SMALLINT DEFAULT 50 CHECK (urgency BETWEEN 1 AND 100),
  is_completed  BOOLEAN DEFAULT false,
  position      INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Workload score as a generated column (urgency 60%, difficulty 40%)
ALTER TABLE subtasks
  ADD COLUMN IF NOT EXISTS workload_score DECIMAL(5,1)
    GENERATED ALWAYS AS (ROUND((urgency * 0.6 + difficulty * 0.4)::NUMERIC, 1)) STORED;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;

-- RLS
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Members of the project can read subtasks
CREATE POLICY "subtasks_select" ON subtasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
      WHERE t.id = subtasks.task_id
        AND pm.user_id = auth.uid()
    )
  );

-- Members can insert subtasks
CREATE POLICY "subtasks_insert" ON subtasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
      WHERE t.id = subtasks.task_id
        AND pm.user_id = auth.uid()
    )
  );

-- Members can update subtasks
CREATE POLICY "subtasks_update" ON subtasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
      WHERE t.id = subtasks.task_id
        AND pm.user_id = auth.uid()
    )
  );

-- Members can delete subtasks
CREATE POLICY "subtasks_delete" ON subtasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
      WHERE t.id = subtasks.task_id
        AND pm.user_id = auth.uid()
    )
  );

-- Index for fast lookup by task
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);

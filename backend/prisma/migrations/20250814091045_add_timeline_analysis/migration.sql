-- CreateTable
CREATE TABLE "timeline_analysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "memory_record_id" INTEGER NOT NULL,
    "conversation_id" INTEGER,
    "analysis_stage" TEXT NOT NULL,
    "psychological_insight" TEXT NOT NULL,
    "emotional_state" TEXT,
    "growth_indicators" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "timeline_analysis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "timeline_analysis_memory_record_id_fkey" FOREIGN KEY ("memory_record_id") REFERENCES "memory_records" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "timeline_analysis_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

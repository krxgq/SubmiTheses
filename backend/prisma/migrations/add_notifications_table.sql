-- CreateTable: notifications
-- This table stores user notifications for the system
CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "public"."notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_read" ON "public"."notifications"("read");

-- CreateIndex
CREATE INDEX "idx_notifications_created_at" ON "public"."notifications"("created_at");

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- RLS removed (no longer using Supabase auth)

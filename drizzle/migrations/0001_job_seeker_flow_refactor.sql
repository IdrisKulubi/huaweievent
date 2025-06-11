-- Migration: Job Seeker Flow Refactoring
-- Add new fields to job_seeker table and create new tables for booth assignments and bulk notifications

-- Add new fields to job_seeker table
ALTER TABLE "job_seeker" ADD COLUMN "assignment_status" text DEFAULT 'unassigned';
ALTER TABLE "job_seeker" ADD COLUMN "priority_level" text DEFAULT 'normal';

-- Add constraints for new fields
ALTER TABLE "job_seeker" ADD CONSTRAINT "job_seeker_assignment_status_check" CHECK ("assignment_status" IN ('unassigned', 'assigned', 'confirmed', 'completed'));
ALTER TABLE "job_seeker" ADD CONSTRAINT "job_seeker_priority_level_check" CHECK ("priority_level" IN ('low', 'normal', 'high'));

-- Create index for assignment status
CREATE INDEX "job_seeker_assignment_status_idx" ON "job_seeker" ("assignment_status");

-- Create booth_assignment table
CREATE TABLE "booth_assignment" (
    "id" text PRIMARY KEY NOT NULL,
    "job_seeker_id" text NOT NULL,
    "booth_id" text NOT NULL,
    "interview_slot_id" text,
    "assigned_by" text NOT NULL,
    "assigned_at" timestamp DEFAULT now() NOT NULL,
    "status" text DEFAULT 'assigned' NOT NULL,
    "interview_date" timestamp,
    "interview_time" text,
    "notes" text,
    "priority" text DEFAULT 'medium' NOT NULL,
    "notification_sent" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "booth_assignment_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "job_seeker"("id") ON DELETE cascade,
    CONSTRAINT "booth_assignment_booth_id_booth_id_fk" FOREIGN KEY ("booth_id") REFERENCES "booth"("id") ON DELETE cascade,
    CONSTRAINT "booth_assignment_interview_slot_id_interview_slot_id_fk" FOREIGN KEY ("interview_slot_id") REFERENCES "interview_slot"("id") ON DELETE set null,
    CONSTRAINT "booth_assignment_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE cascade,
    CONSTRAINT "booth_assignment_status_check" CHECK ("status" IN ('assigned', 'confirmed', 'completed', 'cancelled', 'no_show')),
    CONSTRAINT "booth_assignment_priority_check" CHECK ("priority" IN ('high', 'medium', 'low'))
);

-- Create indexes for booth_assignment table
CREATE INDEX "booth_assignment_job_seeker_idx" ON "booth_assignment" ("job_seeker_id");
CREATE INDEX "booth_assignment_booth_idx" ON "booth_assignment" ("booth_id");
CREATE INDEX "booth_assignment_assigned_by_idx" ON "booth_assignment" ("assigned_by");
CREATE INDEX "booth_assignment_status_idx" ON "booth_assignment" ("status");
CREATE INDEX "booth_assignment_date_idx" ON "booth_assignment" ("interview_date");

-- Create bulk_notification table
CREATE TABLE "bulk_notification" (
    "id" text PRIMARY KEY NOT NULL,
    "campaign_name" text NOT NULL,
    "notification_type" text NOT NULL,
    "template_type" text NOT NULL,
    "subject" text,
    "message" text NOT NULL,
    "recipient_count" integer NOT NULL,
    "sent_count" integer DEFAULT 0 NOT NULL,
    "failed_count" integer DEFAULT 0 NOT NULL,
    "status" text DEFAULT 'draft' NOT NULL,
    "scheduled_at" timestamp,
    "started_at" timestamp,
    "completed_at" timestamp,
    "created_by" text NOT NULL,
    "metadata" json,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "bulk_notification_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE cascade,
    CONSTRAINT "bulk_notification_notification_type_check" CHECK ("notification_type" IN ('email', 'sms', 'both')),
    CONSTRAINT "bulk_notification_status_check" CHECK ("status" IN ('draft', 'pending', 'sending', 'completed', 'failed', 'cancelled'))
);

-- Create indexes for bulk_notification table
CREATE INDEX "bulk_notification_created_by_idx" ON "bulk_notification" ("created_by");
CREATE INDEX "bulk_notification_status_idx" ON "bulk_notification" ("status");
CREATE INDEX "bulk_notification_type_idx" ON "bulk_notification" ("notification_type");
CREATE INDEX "bulk_notification_scheduled_idx" ON "bulk_notification" ("scheduled_at");

-- Create notification_recipient table
CREATE TABLE "notification_recipient" (
    "id" text PRIMARY KEY NOT NULL,
    "bulk_notification_id" text NOT NULL,
    "job_seeker_id" text NOT NULL,
    "booth_assignment_id" text,
    "email_status" text DEFAULT 'pending' NOT NULL,
    "sms_status" text DEFAULT 'pending' NOT NULL,
    "email_sent_at" timestamp,
    "sms_sent_at" timestamp,
    "email_delivered_at" timestamp,
    "sms_delivered_at" timestamp,
    "email_error" text,
    "sms_error" text,
    "email_message_id" text,
    "sms_message_id" text,
    "opened" boolean DEFAULT false NOT NULL,
    "clicked" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "notification_recipient_bulk_notification_id_bulk_notification_id_fk" FOREIGN KEY ("bulk_notification_id") REFERENCES "bulk_notification"("id") ON DELETE cascade,
    CONSTRAINT "notification_recipient_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "job_seeker"("id") ON DELETE cascade,
    CONSTRAINT "notification_recipient_booth_assignment_id_booth_assignment_id_fk" FOREIGN KEY ("booth_assignment_id") REFERENCES "booth_assignment"("id") ON DELETE set null,
    CONSTRAINT "notification_recipient_email_status_check" CHECK ("email_status" IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    CONSTRAINT "notification_recipient_sms_status_check" CHECK ("sms_status" IN ('pending', 'sent', 'delivered', 'failed'))
);

-- Create indexes for notification_recipient table
CREATE INDEX "notification_recipient_bulk_idx" ON "notification_recipient" ("bulk_notification_id");
CREATE INDEX "notification_recipient_job_seeker_idx" ON "notification_recipient" ("job_seeker_id");
CREATE INDEX "notification_recipient_booth_assignment_idx" ON "notification_recipient" ("booth_assignment_id");
CREATE INDEX "notification_recipient_email_status_idx" ON "notification_recipient" ("email_status");
CREATE INDEX "notification_recipient_sms_status_idx" ON "notification_recipient" ("sms_status"); 
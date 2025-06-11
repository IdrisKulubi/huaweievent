CREATE TABLE "booth_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"booth_id" text NOT NULL,
	"interview_slot_id" text,
	"assigned_by" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'assigned',
	"interview_date" timestamp,
	"interview_time" text,
	"notes" text,
	"priority" text DEFAULT 'medium',
	"notification_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bulk_notification" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_name" text NOT NULL,
	"notification_type" text NOT NULL,
	"template_type" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"recipient_count" integer NOT NULL,
	"sent_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"status" text DEFAULT 'draft',
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_by" text NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_recipient" (
	"id" text PRIMARY KEY NOT NULL,
	"bulk_notification_id" text NOT NULL,
	"job_seeker_id" text NOT NULL,
	"booth_assignment_id" text,
	"email_status" text DEFAULT 'pending',
	"sms_status" text DEFAULT 'pending',
	"email_sent_at" timestamp,
	"sms_sent_at" timestamp,
	"email_delivered_at" timestamp,
	"sms_delivered_at" timestamp,
	"email_error" text,
	"sms_error" text,
	"email_message_id" text,
	"sms_message_id" text,
	"opened" boolean DEFAULT false,
	"clicked" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_seeker" ADD COLUMN "assignment_status" text DEFAULT 'unassigned';--> statement-breakpoint
ALTER TABLE "job_seeker" ADD COLUMN "priority_level" text DEFAULT 'normal';--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_booth_id_booth_id_fk" FOREIGN KEY ("booth_id") REFERENCES "public"."booth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_interview_slot_id_interview_slot_id_fk" FOREIGN KEY ("interview_slot_id") REFERENCES "public"."interview_slot"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_notification" ADD CONSTRAINT "bulk_notification_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_bulk_notification_id_bulk_notification_id_fk" FOREIGN KEY ("bulk_notification_id") REFERENCES "public"."bulk_notification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_booth_assignment_id_booth_assignment_id_fk" FOREIGN KEY ("booth_assignment_id") REFERENCES "public"."booth_assignment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booth_assignment_job_seeker_idx" ON "booth_assignment" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "booth_assignment_booth_idx" ON "booth_assignment" USING btree ("booth_id");--> statement-breakpoint
CREATE INDEX "booth_assignment_assigned_by_idx" ON "booth_assignment" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "booth_assignment_status_idx" ON "booth_assignment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booth_assignment_date_idx" ON "booth_assignment" USING btree ("interview_date");--> statement-breakpoint
CREATE INDEX "bulk_notification_created_by_idx" ON "bulk_notification" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "bulk_notification_status_idx" ON "bulk_notification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bulk_notification_type_idx" ON "bulk_notification" USING btree ("notification_type");--> statement-breakpoint
CREATE INDEX "bulk_notification_scheduled_idx" ON "bulk_notification" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "notification_recipient_bulk_idx" ON "notification_recipient" USING btree ("bulk_notification_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_job_seeker_idx" ON "notification_recipient" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_booth_assignment_idx" ON "notification_recipient" USING btree ("booth_assignment_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_email_status_idx" ON "notification_recipient" USING btree ("email_status");--> statement-breakpoint
CREATE INDEX "notification_recipient_sms_status_idx" ON "notification_recipient" USING btree ("sms_status");--> statement-breakpoint
CREATE INDEX "job_seeker_assignment_status_idx" ON "job_seeker" USING btree ("assignment_status");
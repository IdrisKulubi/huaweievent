CREATE TABLE "candidate_interaction" (
	"id" text PRIMARY KEY NOT NULL,
	"employer_id" text NOT NULL,
	"job_seeker_id" text NOT NULL,
	"event_id" text,
	"interaction_type" text NOT NULL,
	"duration" integer,
	"notes" text,
	"rating" integer,
	"metadata" json,
	"performed_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_application" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"job_seeker_id" text NOT NULL,
	"status" text DEFAULT 'applied',
	"cover_letter" text,
	"resume_url" text,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"notes" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shortlist" (
	"id" text PRIMARY KEY NOT NULL,
	"employer_id" text NOT NULL,
	"job_id" text,
	"event_id" text,
	"job_seeker_id" text NOT NULL,
	"list_name" text DEFAULT 'Main Shortlist' NOT NULL,
	"status" text DEFAULT 'interested',
	"priority" text DEFAULT 'medium',
	"notes" text,
	"tags" json,
	"added_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_seeker" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_added_by_user_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "candidate_interaction_employer_idx" ON "candidate_interaction" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX "candidate_interaction_job_seeker_idx" ON "candidate_interaction" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "candidate_interaction_event_idx" ON "candidate_interaction" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "candidate_interaction_type_idx" ON "candidate_interaction" USING btree ("interaction_type");--> statement-breakpoint
CREATE INDEX "candidate_interaction_performed_by_idx" ON "candidate_interaction" USING btree ("performed_by");--> statement-breakpoint
CREATE INDEX "candidate_interaction_created_at_idx" ON "candidate_interaction" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "job_application_job_idx" ON "job_application" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_application_job_seeker_idx" ON "job_application" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "job_application_status_idx" ON "job_application" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_application_applied_at_idx" ON "job_application" USING btree ("applied_at");--> statement-breakpoint
CREATE INDEX "job_application_reviewed_by_idx" ON "job_application" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "shortlist_employer_idx" ON "shortlist" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX "shortlist_job_idx" ON "shortlist" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "shortlist_job_seeker_idx" ON "shortlist" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "shortlist_status_idx" ON "shortlist" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shortlist_priority_idx" ON "shortlist" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "shortlist_added_by_idx" ON "shortlist" USING btree ("added_by");
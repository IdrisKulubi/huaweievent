-- Migration: Add additional_documents column to job_seeker table
-- Created: 2024-12-19
-- Description: Allow job seekers to upload additional documents beyond their CV

ALTER TABLE "job_seeker" ADD COLUMN "additional_documents" json; 
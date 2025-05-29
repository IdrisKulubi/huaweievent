"use server";

import db from "@/db/drizzle";
import { users, jobSeekers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateSecurePin, generateTicketNumber } from "@/lib/utils/security";
import { sendWelcomeEmail, sendWelcomeSMS } from "@/lib/utils/notifications";
import { auth } from "@/lib/auth";

interface CreateJobSeekerProfileData {
  userId: string;
  fullName: string;
  phoneNumber: string;
  bio: string;
  jobSectors: string[];
  educationLevel: string;
  experienceLevel: string;
  timePreference: string;
  skills: string[];
  linkedinUrl?: string;
  portfolioUrl?: string;
  expectedSalary?: string;
  availableFrom: string;
  cvUrl: string;
  interestCategories: string[];
}

export async function createJobSeekerProfile(data: CreateJobSeekerProfileData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(jobSeekers)
      .where(eq(jobSeekers.userId, data.userId))
      .limit(1);

    if (existingProfile.length > 0) {
      throw new Error("Profile already exists for this user");
    }

    // Generate PIN and ticket number
    const pin = generateSecurePin();
    const ticketNumber = generateTicketNumber();
    const pinExpirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Start transaction
    await db.transaction(async (tx: any) => {
      // Update user table with basic info
      await tx
        .update(users)
        .set({
          name: data.fullName,
          phoneNumber: data.phoneNumber,
          role: "job_seeker",
          updatedAt: new Date(),
        })
        .where(eq(users.id, data.userId));

      // Create job seeker profile
      await tx
        .insert(jobSeekers)
        .values({
          id: crypto.randomUUID(),
          userId: data.userId,
          bio: data.bio,
          cvUrl: data.cvUrl,
          skills: data.skills,
          experience: data.experienceLevel,
          education: data.educationLevel,
          pin: pin,
          ticketNumber: ticketNumber,
          registrationStatus: "pending",
          interestCategories: data.interestCategories,
          linkedinUrl: data.linkedinUrl || null,
          portfolioUrl: data.portfolioUrl || null,
          expectedSalary: data.expectedSalary || null,
          availableFrom: new Date(data.availableFrom),
          pinGeneratedAt: new Date(),
          pinExpiresAt: pinExpirationTime,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    });

    // Send notifications
    const user = await getUserById(data.userId);
    if (user) {
      // Send welcome email with PIN
      await sendWelcomeEmail({
        email: user.email,
        name: data.fullName,
        pin: pin,
        ticketNumber: ticketNumber,
        eventDetails: {
          name: "Huawei Career Summit",
          date: "December 15-16, 2024",
          venue: "KICC, Nairobi",
        }
      });

      // Send welcome SMS with PIN
      await sendWelcomeSMS({
        phoneNumber: data.phoneNumber,
        name: data.fullName,
        pin: pin,
        ticketNumber: ticketNumber,
      });
    }

    return {
      success: true,
      message: "Profile created successfully",
      data: {
        pin,
        ticketNumber,
      }
    };

  } catch (error) {
    console.error("Error creating job seeker profile:", error);
    throw new Error("Failed to create profile. Please try again.");
  }
}

export async function getUserProfile(userId: string) {
  try {
    const result = await db
      .select({
        user: users,
        jobSeeker: jobSeekers,
      })
      .from(users)
      .leftJoin(jobSeekers, eq(jobSeekers.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const { user, jobSeeker } = result[0];
    
    return {
      ...user,
      jobSeeker,
      profileComplete: !!jobSeeker?.id,
    };

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function getUserById(userId: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<CreateJobSeekerProfileData>) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    await db.transaction(async (tx: any) => {
      // Update user table if name or phone changed
      if (updates.fullName || updates.phoneNumber) {
        await tx
          .update(users)
          .set({
            ...(updates.fullName && { name: updates.fullName }),
            ...(updates.phoneNumber && { phoneNumber: updates.phoneNumber }),
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }

      // Update job seeker profile
      const jobSeekerUpdates: any = {};
      
      if (updates.bio) jobSeekerUpdates.bio = updates.bio;
      if (updates.cvUrl) jobSeekerUpdates.cvUrl = updates.cvUrl;
      if (updates.skills) jobSeekerUpdates.skills = updates.skills;
      if (updates.experienceLevel) jobSeekerUpdates.experience = updates.experienceLevel;
      if (updates.educationLevel) jobSeekerUpdates.education = updates.educationLevel;
      if (updates.interestCategories) jobSeekerUpdates.interestCategories = updates.interestCategories;
      if (updates.linkedinUrl !== undefined) jobSeekerUpdates.linkedinUrl = updates.linkedinUrl || null;
      if (updates.portfolioUrl !== undefined) jobSeekerUpdates.portfolioUrl = updates.portfolioUrl || null;
      if (updates.expectedSalary !== undefined) jobSeekerUpdates.expectedSalary = updates.expectedSalary || null;
      if (updates.availableFrom) jobSeekerUpdates.availableFrom = new Date(updates.availableFrom);

      if (Object.keys(jobSeekerUpdates).length > 0) {
        jobSeekerUpdates.updatedAt = new Date();
        
        await tx
          .update(jobSeekers)
          .set(jobSeekerUpdates)
          .where(eq(jobSeekers.userId, userId));
      }
    });

    return {
      success: true,
      message: "Profile updated successfully",
    };

  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update profile. Please try again.");
  }
}

export async function regeneratePin(userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const newPin = generateSecurePin();
    const pinExpirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await db
      .update(jobSeekers)
      .set({
        pin: newPin,
        pinGeneratedAt: new Date(),
        pinExpiresAt: pinExpirationTime,
        updatedAt: new Date(),
      })
      .where(eq(jobSeekers.userId, userId));

    // Get user details for notifications
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      // Send new PIN via email and SMS
      await sendWelcomeEmail({
        email: userProfile.email,
        name: userProfile.name || "Job Seeker",
        pin: newPin,
        ticketNumber: userProfile.jobSeeker?.ticketNumber || "",
        eventDetails: {
          name: "Huawei Career Summit",
          date: "December 15-16, 2024",
          venue: "KICC, Nairobi",
        }
      });

      if (userProfile.phoneNumber) {
        await sendWelcomeSMS({
          phoneNumber: userProfile.phoneNumber,
          name: userProfile.name || "Job Seeker",
          pin: newPin,
          ticketNumber: userProfile.jobSeeker?.ticketNumber || "",
        });
      }
    }

    return {
      success: true,
      message: "New PIN generated and sent successfully",
      pin: newPin,
    };

  } catch (error) {
    console.error("Error regenerating PIN:", error);
    throw new Error("Failed to regenerate PIN. Please try again.");
  }
}

export async function verifyPin(ticketNumber: string, pin: string) {
  try {
    const result = await db
      .select({
        jobSeeker: jobSeekers,
        user: users,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(
        and(
          eq(jobSeekers.ticketNumber, ticketNumber),
          eq(jobSeekers.pin, pin)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return {
        success: false,
        message: "Invalid ticket number or PIN",
      };
    }

    const { jobSeeker, user } = result[0];

    // Check if PIN has expired
    if (jobSeeker.pinExpiresAt && new Date() > jobSeeker.pinExpiresAt) {
      return {
        success: false,
        message: "PIN has expired. Please request a new one.",
        expired: true,
      };
    }

    // Update registration status to approved
    await db
      .update(jobSeekers)
      .set({
        registrationStatus: "approved",
        updatedAt: new Date(),
      })
      .where(eq(jobSeekers.id, jobSeeker.id));

    return {
      success: true,
      message: "PIN verified successfully",
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        ticketNumber: jobSeeker.ticketNumber,
      },
    };

  } catch (error) {
    console.error("Error verifying PIN:", error);
    return {
      success: false,
      message: "An error occurred during verification. Please try again.",
    };
  }
}

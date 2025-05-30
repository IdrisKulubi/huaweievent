"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { booths, employers, events, interviewSlots } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createOrUpdateBooth(formData: {
  eventId: string;
  boothNumber: string;
  location: string;
  size: "small" | "medium" | "large";
  equipment: string[];
  specialRequirements?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get employer profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return { success: false, message: "Employer profile not found" };
    }

    const employer = employerProfile[0];

    // Check if booth already exists for this employer and event
    const existingBooth = await db
      .select()
      .from(booths)
      .where(
        and(
          eq(booths.employerId, employer.id),
          eq(booths.eventId, formData.eventId)
        )
      )
      .limit(1);

    if (existingBooth[0]) {
      // Update existing booth
      await db
        .update(booths)
        .set({
          boothNumber: formData.boothNumber,
          location: formData.location,
          size: formData.size,
          equipment: formData.equipment,
          specialRequirements: formData.specialRequirements,
          updatedAt: new Date(),
        })
        .where(eq(booths.id, existingBooth[0].id));

      revalidatePath("/employer");
      revalidatePath("/employer/booths");
      
      return { 
        success: true, 
        message: "Booth updated successfully",
        boothId: existingBooth[0].id
      };
    } else {
      // Create new booth
      const boothId = `booth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(booths).values({
        id: boothId,
        eventId: formData.eventId,
        employerId: employer.id,
        boothNumber: formData.boothNumber,
        location: formData.location,
        size: formData.size,
        equipment: formData.equipment,
        specialRequirements: formData.specialRequirements,
        isActive: true,
      });

      revalidatePath("/employer");
      revalidatePath("/employer/booths");
      
      return { 
        success: true, 
        message: "Booth created successfully",
        boothId
      };
    }
  } catch (error) {
    console.error("Error creating/updating booth:", error);
    return { success: false, message: "Failed to create/update booth" };
  }
}

export async function createInterviewSlot(formData: {
  boothId: string;
  jobId?: string;
  startTime: string;
  duration: number;
  interviewerName?: string;
  notes?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get employer profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return { success: false, message: "Employer profile not found" };
    }

    // Verify booth belongs to this employer
    const booth = await db
      .select()
      .from(booths)
      .where(
        and(
          eq(booths.id, formData.boothId),
          eq(booths.employerId, employerProfile[0].id)
        )
      )
      .limit(1);

    if (!booth[0]) {
      return { success: false, message: "Booth not found or access denied" };
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(startTime.getTime() + formData.duration * 60000);

    // Check for conflicting slots
    const conflictingSlots = await db
      .select()
      .from(interviewSlots)
      .where(
        and(
          eq(interviewSlots.boothId, formData.boothId),
          // Check for time overlap
        )
      );

    const slotId = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(interviewSlots).values({
      id: slotId,
      boothId: formData.boothId,
      jobId: formData.jobId || null,
      startTime,
      endTime,
      duration: formData.duration,
      isBooked: false,
      interviewerName: formData.interviewerName,
      notes: formData.notes,
    });

    revalidatePath("/employer");
    revalidatePath("/employer/interviews");
    
    return { 
      success: true, 
      message: "Interview slot created successfully",
      slotId
    };
  } catch (error) {
    console.error("Error creating interview slot:", error);
    return { success: false, message: "Failed to create interview slot" };
  }
}

export async function getEmployerBooth(eventId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    // Get employer profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return null;
    }

    const employer = employerProfile[0];

    // Get booth for this employer
    const boothQuery = db
      .select({
        booth: booths,
        event: events,
      })
      .from(booths)
      .leftJoin(events, eq(events.id, booths.eventId))
      .where(eq(booths.employerId, employer.id));

    if (eventId) {
      boothQuery.where(eq(booths.eventId, eventId));
    }

    const result = await boothQuery.limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching employer booth:", error);
    return null;
  }
}

export async function deleteInterviewSlot(slotId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Get employer profile
    const employerProfile = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, session.user.id))
      .limit(1);

    if (!employerProfile[0]) {
      return { success: false, message: "Employer profile not found" };
    }

    // Verify slot belongs to this employer through booth
    const slot = await db
      .select({
        slot: interviewSlots,
        booth: booths,
      })
      .from(interviewSlots)
      .leftJoin(booths, eq(booths.id, interviewSlots.boothId))
      .where(
        and(
          eq(interviewSlots.id, slotId),
          eq(booths.employerId, employerProfile[0].id)
        )
      )
      .limit(1);

    if (!slot[0]) {
      return { success: false, message: "Interview slot not found or access denied" };
    }

    if (slot[0].slot.isBooked) {
      return { success: false, message: "Cannot delete a booked interview slot" };
    }

    await db.delete(interviewSlots).where(eq(interviewSlots.id, slotId));

    revalidatePath("/employer");
    revalidatePath("/employer/interviews");
    
    return { success: true, message: "Interview slot deleted successfully" };
  } catch (error) {
    console.error("Error deleting interview slot:", error);
    return { success: false, message: "Failed to delete interview slot" };
  }
} 
"use server";

import db from "@/db/drizzle";
import { jobSeekers, users, attendanceRecords, events } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { validatePinFormat, validateTicketNumberFormat } from "@/lib/utils/security";

export async function verifyAttendeePin(pin: string, securityId: string) {
  try {
    // Validate PIN format
    if (!validatePinFormat(pin)) {
      return {
        success: false,
        message: "Invalid PIN format. Please enter a 6-digit PIN."
      };
    }

    // Find job seeker by PIN
    const jobSeeker = await db
      .select({
        id: jobSeekers.id,
        userId: jobSeekers.userId,
        pin: jobSeekers.pin,
        ticketNumber: jobSeekers.ticketNumber,
        registrationStatus: jobSeekers.registrationStatus,
        userName: users.name,
        userEmail: users.email,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(jobSeekers.userId, users.id))
      .where(eq(jobSeekers.pin, pin))
      .limit(1);

    if (!jobSeeker[0]) {
      return {
        success: false,
        message: "Invalid PIN. No attendee found with this PIN."
      };
    }

    const attendee = jobSeeker[0];

    // Check if attendee is approved
    if (attendee.registrationStatus !== "approved") {
      return {
        success: false,
        message: `Attendee registration is ${attendee.registrationStatus}. Cannot check in.`
      };
    }

    // Check if already checked in today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingCheckIn = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.jobSeekerId, attendee.id),
          eq(attendanceRecords.status, "checked_in")
        )
      )
      .orderBy(desc(attendanceRecords.checkInTime))
      .limit(1);

    // Get current active event (this should be configurable)
    const activeEvent = await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .limit(1);

    if (!activeEvent[0]) {
      return {
        success: false,
        message: "No active event found. Cannot process check-in."
      };
    }

    const alreadyCheckedIn = existingCheckIn.length > 0;

    // Create attendance record even if already checked in (for audit trail)
    await db.insert(attendanceRecords).values({
      id: crypto.randomUUID(),
      jobSeekerId: attendee.id,
      eventId: activeEvent[0].id,
      verifiedBy: securityId,
      verificationMethod: "pin",
      verificationData: pin,
      status: "checked_in",
      notes: alreadyCheckedIn ? "Duplicate check-in attempt" : undefined,
    });

    return {
      success: true,
      message: alreadyCheckedIn 
        ? "Attendee was already checked in, but verification logged."
        : "Attendee successfully verified and checked in.",
      attendee: {
        id: attendee.id,
        name: attendee.userName,
        email: attendee.userEmail,
        pin: attendee.pin,
        ticketNumber: attendee.ticketNumber,
        registrationStatus: attendee.registrationStatus,
        checkInTime: existingCheckIn[0]?.checkInTime.toLocaleString(),
        alreadyCheckedIn,
      }
    };

  } catch (error) {
    console.error("PIN verification error:", error);
    return {
      success: false,
      message: "Verification failed due to system error. Please try again."
    };
  }
}

export async function verifyAttendeeTicket(ticketNumber: string, securityId: string) {
  try {
    // Validate ticket format
    if (!validateTicketNumberFormat(ticketNumber)) {
      return {
        success: false,
        message: "Invalid ticket format. Expected format: HCS-YYYY-XXXXXXXX"
      };
    }

    // Find job seeker by ticket number
    const jobSeeker = await db
      .select({
        id: jobSeekers.id,
        userId: jobSeekers.userId,
        pin: jobSeekers.pin,
        ticketNumber: jobSeekers.ticketNumber,
        registrationStatus: jobSeekers.registrationStatus,
        userName: users.name,
        userEmail: users.email,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(jobSeekers.userId, users.id))
      .where(eq(jobSeekers.ticketNumber, ticketNumber))
      .limit(1);

    if (!jobSeeker[0]) {
      return {
        success: false,
        message: "Invalid ticket number. No attendee found with this ticket."
      };
    }

    const attendee = jobSeeker[0];

    // Check if attendee is approved
    if (attendee.registrationStatus !== "approved") {
      return {
        success: false,
        message: `Attendee registration is ${attendee.registrationStatus}. Cannot check in.`
      };
    }

    // Check if already checked in
    const existingCheckIn = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.jobSeekerId, attendee.id),
          eq(attendanceRecords.status, "checked_in")
        )
      )
      .orderBy(desc(attendanceRecords.checkInTime))
      .limit(1);

    // Get current active event
    const activeEvent = await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .limit(1);

    if (!activeEvent[0]) {
      return {
        success: false,
        message: "No active event found. Cannot process check-in."
      };
    }

    const alreadyCheckedIn = existingCheckIn.length > 0;

    // Create attendance record
    await db.insert(attendanceRecords).values({
      id: crypto.randomUUID(),
      jobSeekerId: attendee.id,
      eventId: activeEvent[0].id,
      verifiedBy: securityId,
      verificationMethod: "ticket_number",
      verificationData: ticketNumber,
      status: "checked_in",
      notes: alreadyCheckedIn ? "Duplicate check-in attempt" : undefined,
    });

    return {
      success: true,
      message: alreadyCheckedIn 
        ? "Attendee was already checked in, but verification logged."
        : "Attendee successfully verified and checked in.",
      attendee: {
        id: attendee.id,
        name: attendee.userName,
        email: attendee.userEmail,
        pin: attendee.pin,
        ticketNumber: attendee.ticketNumber,
        registrationStatus: attendee.registrationStatus,
        checkInTime: existingCheckIn[0]?.checkInTime.toLocaleString(),
        alreadyCheckedIn,
      }
    };

  } catch (error) {
    console.error("Ticket verification error:", error);
    return {
      success: false,
      message: "Verification failed due to system error. Please try again."
    };
  }
} 
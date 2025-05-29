export interface SecurityPersonnel {
    id: string;
    userId: string;
    badgeNumber: string | null;
    department: string | null;
    clearanceLevel: "basic" | "intermediate" | "advanced";
    assignedCheckpoints: string[];
    isOnDuty: boolean;
    shiftStart: Date | null;
    shiftEnd: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Checkpoint {
    id: string;
    eventId: string;
    name: string;
    location: string;
    checkpointType: "entry" | "exit" | "booth_area" | "main_hall" | "registration";
    isActive: boolean;
    requiresVerification: boolean;
    maxCapacity: number | null;
    currentOccupancy: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface AttendanceRecord {
    id: string;
    jobSeekerId: string;
    eventId: string;
    checkpointId: string | null;
    verifiedBy: string | null;
    checkInTime: Date;
    checkOutTime: Date | null;
    verificationMethod: "qr_code" | "ticket_number" | "manual";
    verificationData: string | null;
    status: "checked_in" | "checked_out" | "flagged";
    notes: string | null;
    ipAddress: string | null;
    deviceInfo: string | null;
    createdAt: Date;
  }
  
  export interface SecurityIncident {
    id: string;
    eventId: string;
    reportedBy: string;
    incidentType: "unauthorized_access" | "suspicious_activity" | "emergency" | "technical_issue" | "other";
    severity: "low" | "medium" | "high" | "critical";
    location: string;
    description: string;
    involvedPersons: string[];
    actionTaken: string | null;
    status: "open" | "investigating" | "resolved" | "closed";
    resolvedBy: string | null;
    resolvedAt: Date | null;
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface VerificationRequest {
    qrCode?: string;
    ticketNumber?: string;
    checkpointId: string;
    verificationMethod: "qr_code" | "ticket_number" | "manual";
    notes?: string;
  }
  
  export interface VerificationResult {
    success: boolean;
    jobSeeker?: {
      id: string;
      name: string;
      email: string;
      ticketNumber: string;
      qrCode: string;
      registrationStatus: string;
    };
    attendanceRecord?: AttendanceRecord;
    error?: string;
    message: string;
  }
  
  export interface SecurityDashboardStats {
    totalCheckIns: number;
    activeCheckpoints: number;
    onDutyPersonnel: number;
    pendingIncidents: number;
    recentActivity: AttendanceRecord[];
    checkpointOccupancy: {
      checkpointId: string;
      name: string;
      currentOccupancy: number;
      maxCapacity: number | null;
    }[];
  }
  
  export interface IncidentReport {
    incidentType: SecurityIncident["incidentType"];
    severity: SecurityIncident["severity"];
    location: string;
    description: string;
    involvedPersons?: string[];
    attachments?: File[];
  } 
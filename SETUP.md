# Huawei Career Summit - Profile Setup System

## Overview

This system provides a comprehensive profile setup flow for job seekers registering for the Huawei Career Summit 2024. After Google OAuth login, users complete a 4-step profile form and receive PIN codes via email and SMS.

## Features

- **4-Step Profile Form**: Personal info, career interests, education/experience, preferences
- **CV Upload**: Secure file upload to Cloudflare R2 with validation
- **PIN Generation**: Secure 6-digit PIN for event check-in
- **Notifications**: Welcome email and SMS with PIN codes
- **Mobile-First Design**: Responsive and accessible UI
- **Type Safety**: Full TypeScript implementation

## Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/huaweievent"

# NextAuth.js
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCOUNT_ID="your-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-access-key"
CLOUDFLARE_R2_BUCKET_NAME="huawei-event-cvs"
CLOUDFLARE_R2_PUBLIC_URL="https://your-custom-domain.com"

# Email Service (Optional - for actual email sending)
RESEND_API_KEY="your-resend-api-key"

# SMS Service (Optional - for actual SMS sending)
AFRICAS_TALKING_API_KEY="your-africas-talking-api-key"
AFRICAS_TALKING_USERNAME="your-username"
AFRICAS_TALKING_SHORTCODE="your-shortcode"
```

## Cloudflare R2 Setup

1. **Create R2 Bucket**:
   - Go to Cloudflare Dashboard > R2 Object Storage
   - Create a new bucket named `huawei-event-cvs`
   - Set up public access if needed

2. **Generate API Tokens**:
   - Go to "Manage R2 API Tokens"
   - Create token with Object Read and Write permissions
   - Save the Access Key ID and Secret Access Key

3. **Custom Domain (Optional)**:
   - Set up a custom domain for public file access
   - Update `CLOUDFLARE_R2_PUBLIC_URL` with your domain

## Profile Setup Flow

### Step 1: Personal Information
- Full name (auto-filled from Google)
- Email address (read-only, from Google)
- Phone number (required)

### Step 2: Career Interests
- Professional bio (50-500 characters)
- Job sectors of interest (multiple selection from 22 categories)

### Step 3: Education & Experience
- Education level (dropdown)
- Experience level (dropdown)
- Key skills (comma-separated)
- CV upload (PDF, DOC, DOCX, max 5MB)

### Step 4: Preferences & Availability
- Preferred interview time slot
- Available start date
- Expected salary (optional)
- LinkedIn profile (optional)
- Portfolio URL (optional)

## Database Schema

The system uses these main tables:

- `users`: Basic user information from auth
- `jobSeekers`: Complete job seeker profiles with PIN, ticket number, etc.

Key fields in `jobSeekers`:
- `pin`: 6-digit verification code
- `ticketNumber`: Format HCS-YYYY-XXXXXXXX
- `registrationStatus`: pending/approved/rejected
- `cvUrl`: Cloudflare R2 file URL
- `interestCategories`: Selected job sectors
- `pinExpiresAt`: PIN expiration timestamp

## API Endpoints

### Server Actions
- `createJobSeekerProfile()`: Create complete profile
- `getUserProfile()`: Get user profile data
- `updateUserProfile()`: Update existing profile
- `regeneratePin()`: Generate new PIN
- `verifyPin()`: Validate PIN for check-in
- `uploadCVToR2()`: Handle CV file upload

## Security Features

- **File Validation**: MIME type and signature validation
- **User Authorization**: Server-side auth checks
- **PIN Security**: Cryptographically secure PIN generation
- **File Access Control**: User-specific file paths in R2
- **Input Validation**: Zod schema validation

## Job Sectors Available

1. Technology & Engineering
2. Software Development
3. Telecommunications
4. Data Science & Analytics
5. Cybersecurity
6. Cloud Computing
7. AI & Machine Learning
8. Marketing & Sales
9. Business Development
10. Project Management
11. Human Resources
12. Finance & Accounting
13. Operations
14. Customer Service
15. Research & Development
16. Quality Assurance
17. Manufacturing
18. Logistics & Supply Chain
19. Design & Creative
20. Healthcare
21. Education & Training
22. Other

## Education Levels

- High School
- Diploma/Certificate
- Bachelor's Degree
- Master's Degree
- PhD
- Professional Certification
- Other

## Experience Levels

- Fresh Graduate
- 0-1 years
- 1-3 years
- 3-5 years
- 5-10 years
- 10+ years

## Time Preferences

- Morning (9:00 AM - 12:00 PM)
- Afternoon (12:00 PM - 3:00 PM)
- Late Afternoon (3:00 PM - 6:00 PM)
- No preference

## File Upload Specifications

- **Allowed Types**: PDF, DOC, DOCX
- **Max Size**: 5MB
- **Storage**: Cloudflare R2
- **Path Format**: `cvs/{userId}/{timestamp}-{random}.{ext}`
- **Validation**: File signature verification for security

## Notification System

Currently configured with placeholder implementations. To enable:

### Email (Resend)
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
```

### SMS (Africa's Talking)
```typescript
const AfricasTalking = require('africastalking')({
  apiKey: process.env.AFRICAS_TALKING_API_KEY,
  username: process.env.AFRICAS_TALKING_USERNAME,
});
```

## Testing the System

1. Start the development server: `pnpm dev`
2. Go to `/login` and sign in with Google
3. Complete the 4-step profile setup
4. Check console logs for email/SMS content
5. Verify profile in `/dashboard`

## Error Handling

- Form validation with real-time feedback
- File upload progress and error states
- Server-side error logging
- User-friendly error messages
- Automatic retry logic for failed uploads

## Next Steps for Production

1. Set up actual email service (Resend/SendGrid)
2. Configure SMS service (Africa's Talking/Twilio)
3. Add proper error monitoring (Sentry)
4. Implement file virus scanning
5. Add rate limiting for uploads
6. Set up backup strategies for R2 
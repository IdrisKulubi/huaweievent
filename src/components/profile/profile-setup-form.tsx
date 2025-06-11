"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Upload, User, Briefcase, GraduationCap, Clock, Phone, Mail, FileText, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { createJobSeekerProfile } from "@/lib/actions/user-actions";
import { toast } from "sonner";
import { CVUploadField } from "@/components/profile/cv-upload-field";

// Job sectors/categories from employer side
const JOB_SECTORS = [
  "Technology & Engineering",
  "Software Development",
  "Telecommunications",
  "Data Science & Analytics",
  "Cybersecurity",
  "Cloud Computing",
  "AI & Machine Learning",
  "Marketing & Sales",
  "Business Development",
  "Project Management",
  "Human Resources",
  "Finance & Accounting",
  "Operations",
  "Customer Service",
  "Research & Development",
  "Quality Assurance",
  "Manufacturing",
  "Logistics & Supply Chain",
  "Design & Creative",
  "Healthcare",
  "Education & Training",
  "Other"
];

const EDUCATION_LEVELS = [
  "High School",
  "Diploma/Certificate",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Professional Certification",
  "Other"
];

const EXPERIENCE_LEVELS = [
  "Fresh Graduate",
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years"
];

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(500, "Bio must be less than 500 characters"),
  jobSectors: z.array(z.string()).min(1, "Please select at least one job sector"),
  educationLevel: z.string().min(1, "Please select your education level"),
  experienceLevel: z.string().min(1, "Please select your experience level"),
  skills: z.string().min(10, "Please enter your key skills"),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please enter a valid portfolio URL").optional().or(z.literal("")),
  expectedSalary: z.string().optional(),
  availableFrom: z.string().min(1, "Please select when you're available to start"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSetupFormProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
}

export function ProfileSetupForm({ user }: ProfileSetupFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploadUrl, setCvUploadUrl] = useState<string>("");

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.name || "",
      jobSectors: [],
    },
    mode: "onChange"
  });

  const toggleSector = (sector: string) => {
    const newSectors = selectedSectors.includes(sector)
      ? selectedSectors.filter(s => s !== sector)
      : [...selectedSectors, sector];
    
    setSelectedSectors(newSectors);
    setValue("jobSectors", newSectors);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ProfileFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["fullName", "phoneNumber"];
        break;
      case 2:
        fieldsToValidate = ["bio", "jobSectors"];
        break;
      case 3:
        fieldsToValidate = ["educationLevel", "experienceLevel", "skills", "availableFrom"];
        break;
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!cvUploadUrl && !cvFile) {
      toast.error("Please upload your CV before submitting");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const skillsArray = data.skills.split(",").map(skill => skill.trim()).filter(Boolean);
      
      const profileData = {
        ...data,
        userId: user.id!,
        cvUrl: cvUploadUrl,
        skills: skillsArray,
        interestCategories: data.jobSectors,
        // Ensure expectedSalary is properly set
        expectedSalary: data.expectedSalary?.trim() || undefined,
      };

      // Debug: Log the data being sent
      console.log("🔍 Frontend sending profile data:", {
        skills: profileData.skills,
        expectedSalary: profileData.expectedSalary,
        skillsType: typeof profileData.skills,
        expectedSalaryType: typeof profileData.expectedSalary,
      });

      await createJobSeekerProfile(profileData);
      
      toast.success("Registration completed! Our team will review your application and assign interview slots. You'll receive notifications with your booth assignment details.");
      
      // Redirect to dashboard or success page
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Profile creation error:", error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 dark:from-slate-800 dark:via-slate-700/50 dark:to-blue-900/20">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Personal Information</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Let's start with your basic details</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300 font-medium">Full Name *</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="Enter your full name"
                    className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="mt-1 h-12 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 mt-2 flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-500" />
                  This is your login email and cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300 font-medium">Phone Number *</Label>
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    placeholder="+254 700 000 000"
                    className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/40 dark:from-slate-800 dark:via-slate-700/50 dark:to-green-900/20">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Career Interests</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Tell us about your professional goals</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300 font-medium">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell employers about yourself, your background, and career goals..."
                  className="mt-1 min-h-[120px] bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200 resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-500">
                    {watch("bio")?.length || 0}/500 characters
                  </p>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    (watch("bio")?.length || 0) >= 50 
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-300' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300'
                  }`}>
                    {(watch("bio")?.length || 0) >= 50 ? '✓ Good length' : 'Need more details'}
                  </div>
                </div>
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {errors.bio.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 dark:text-slate-300 font-medium">Job Sectors of Interest * (Select multiple)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {JOB_SECTORS.map((sector, index) => (
                    <Badge
                      key={sector}
                      variant={selectedSectors.includes(sector) ? "default" : "outline"}
                      className={`cursor-pointer p-3 text-center justify-center transition-all duration-200 hover:scale-105 ${
                        selectedSectors.includes(sector)
                          ? `bg-gradient-to-r ${
                              index % 4 === 0 ? 'from-blue-500 to-indigo-600' :
                              index % 4 === 1 ? 'from-green-500 to-emerald-600' :
                              index % 4 === 2 ? 'from-purple-500 to-violet-600' :
                              'from-orange-500 to-red-500'
                            } text-white shadow-lg border-0`
                          : "hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600"
                      }`}
                      onClick={() => toggleSector(sector)}
                    >
                      {sector}
                    </Badge>
                  ))}
                </div>
                {selectedSectors.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {selectedSectors.length} sector{selectedSectors.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
                {errors.jobSectors && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {errors.jobSectors.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/40 dark:from-slate-800 dark:via-slate-700/50 dark:to-purple-900/20">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Education & Experience</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Share your qualifications and skills</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="educationLevel" className="text-slate-700 dark:text-slate-300 font-medium">Education Level *</Label>
                  <Select onValueChange={(value) => setValue("educationLevel", value)}>
                    <SelectTrigger className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="Select your education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level} className="py-3">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.educationLevel && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {errors.educationLevel.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel" className="text-slate-700 dark:text-slate-300 font-medium">Experience Level *</Label>
                  <Select onValueChange={(value) => setValue("experienceLevel", value)}>
                    <SelectTrigger className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level} className="py-3">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.experienceLevel && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {errors.experienceLevel.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="text-slate-700 dark:text-slate-300 font-medium">Key Skills *</Label>
                <Input
                  id="skills"
                  {...register("skills")}
                  placeholder="e.g., JavaScript, React, Project Management, Communication"
                  className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                />
                <p className="text-sm text-slate-500 bg-purple-50 dark:bg-purple-950/20 p-2 rounded-lg">
                  💡 Separate skills with commas for better readability
                </p>
                {errors.skills && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {errors.skills.message}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30">
                <CVUploadField
                  onFileSelect={setCvFile}
                  onUploadComplete={setCvUploadUrl}
                  currentFile={cvFile}
                />
              </div>

              {/* Availability and Optional Fields */}
              <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Availability & Additional Information
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="availableFrom" className="text-slate-700 dark:text-slate-300 font-medium">Available to Start *</Label>
                    <Input
                      id="availableFrom"
                      type="date"
                      {...register("availableFrom")}
                      className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.availableFrom && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {errors.availableFrom.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedSalary" className="text-slate-700 dark:text-slate-300 font-medium">Expected Salary (Optional)</Label>
                    <Input
                      id="expectedSalary"
                      {...register("expectedSalary")}
                      placeholder="e.g., KES 50,000 - 80,000"
                      className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl" className="text-slate-700 dark:text-slate-300 font-medium">LinkedIn Profile (Optional)</Label>
                    <Input
                      id="linkedinUrl"
                      {...register("linkedinUrl")}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                    />
                    {errors.linkedinUrl && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {errors.linkedinUrl.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl" className="text-slate-700 dark:text-slate-300 font-medium">Portfolio URL (Optional)</Label>
                    <Input
                      id="portfolioUrl"
                      {...register("portfolioUrl")}
                      placeholder="https://yourportfolio.com"
                      className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                    />
                    {errors.portfolioUrl && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {errors.portfolioUrl.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Assignment Notice */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Interview Assignment Process</h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        After registration, our team will review all applications and manually assign interview slots based on your skills and company requirements. 
                        You'll receive an email and SMS notification with your booth assignment and interview details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Complete Your Profile
          </h2>
          <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
            <span className="font-medium">Progress</span>
            <span className="font-semibold">{Math.round(progress)}% Complete</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3 bg-slate-200 dark:bg-slate-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 h-3 rounded-full opacity-80" 
                 style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between items-center mt-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step <= currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {step < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{step}</span>
                )}
              </div>
              {step < 4 && (
                <div className={`w-full h-1 mx-2 transition-all duration-300 ${
                  step < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {renderStep()}

        {/* Enhanced Navigation Buttons */}
        <div className="flex justify-between items-center pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-8 py-3 h-12 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              className="px-8 py-3 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting || !cvUploadUrl}
              className="px-8 py-3 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Profile...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Profile
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
} 
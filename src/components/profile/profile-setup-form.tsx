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
          <Card className="border-t-4 border-t-green-500 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold">Step 1: Your Profile</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Introduce yourself to employers</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300 font-medium">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="e.g., Jane Doe"
                    className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg"><AlertCircle className="w-4 h-4" />{errors.fullName.message}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300 font-medium">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    placeholder="e.g., 0712 345 678"
                    className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg"><AlertCircle className="w-4 h-4" />{errors.phoneNumber.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-t-4 border-t-orange-500 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-semibold">Step 2: Career Interests</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Tell us about your professional goals</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300 font-medium">Your Professional Story *</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Share a brief summary of your career journey, your key strengths, and what you're looking for in your next role. Think of this as your personal introduction to employers."
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
                    {(watch("bio")?.length || 0) >= 50 ? '✓ Good length' : 'Minimum 50 characters'}
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
                <Label className="text-slate-700 dark:text-slate-300 font-medium">Which job areas are you interested in? * (Select at least one)</Label>
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
          <Card className="border-t-4 border-t-purple-500 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-purple-500" />
                  <h3 className="text-xl font-semibold">Step 3: Background & Skills</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Share your qualifications and upload your CV</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="educationLevel" className="text-slate-700 dark:text-slate-300 font-medium">Highest Level of Education *</Label>
                  <Select onValueChange={(value) => setValue("educationLevel", value)}>
                    <SelectTrigger className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="e.g., Bachelor's Degree, Diploma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School / Secondary School</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Vocational/Technical">Vocational/Technical Certificate</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
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
                  <Label htmlFor="experienceLevel" className="text-slate-700 dark:text-slate-300 font-medium">Years of Professional Experience *</Label>
                  <Select onValueChange={(value) => setValue("experienceLevel", value)}>
                    <SelectTrigger className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="e.g., 1-3 years, 5+ years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No Experience">No Experience / Student</SelectItem>
                      <SelectItem value="0-1 years">0 - 1 year</SelectItem>
                      <SelectItem value="1-3 years">1 - 3 years</SelectItem>
                      <SelectItem value="3-5 years">3 - 5 years</SelectItem>
                      <SelectItem value="5-10 years">5 - 10 years</SelectItem>
                      <SelectItem value="10+ years">10+ years</SelectItem>
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
                <Label htmlFor="skills" className="text-slate-700 dark:text-slate-300 font-medium">Your Top Skills *</Label>
                <Input
                  id="skills"
                  {...register("skills")}
                  placeholder="e.g., Customer Service, Sales, Data Entry, Teamwork"
                  className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                />
                <p className="text-sm text-slate-500 bg-purple-50 dark:bg-purple-950/20 p-2 rounded-lg">
                  💡 Tip: Separate each skill with a comma ( , ). List both technical and soft skills.
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

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Your Availability & Links
                </h4>
              
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="availableFrom" className="text-slate-700 dark:text-slate-300 font-medium">When can you start a new job? *</Label>
                    <Input
                      id="availableFrom"
                      type="date"
                      {...register("availableFrom")}
                      className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                    />
                    {errors.availableFrom && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {errors.availableFrom.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedSalary" className="text-slate-700 dark:text-slate-300 font-medium">Expected Monthly Salary (Optional)</Label>
                    <Input
                      id="expectedSalary"
                      {...register("expectedSalary")}
                      placeholder="e.g., KES 50,000"
                      className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl" className="text-slate-700 dark:text-slate-300 font-medium">Your LinkedIn Profile Link (Optional)</Label>
                    <Input
                      id="linkedinUrl"
                      {...register("linkedinUrl")}
                      placeholder="https://linkedin.com/in/your-profile"
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
                    <Label htmlFor="portfolioUrl" className="text-slate-700 dark:text-slate-300 font-medium">Link to Your Work or Portfolio (Optional)</Label>
                    <Input
                      id="portfolioUrl"
                      {...register("portfolioUrl")}
                      placeholder="https://your-portfolio-website.com"
                      className="mt-1 h-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Assignment Notice */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">What Happens Next?</h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Once you submit your profile, our team will carefully review it. We will then match you with suitable companies and assign you an interview time. 
                        You'll receive an email and SMS with all the details. Good luck!
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
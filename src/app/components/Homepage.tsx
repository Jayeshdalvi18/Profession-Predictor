"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Sparkles,
  Brain,
  Briefcase,
  GraduationCap,
  Heart,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { GuestAlert } from "@/components/guest-alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define age groups
const AGE_GROUPS = [
  { id: "student", label: "Student (13-18)", value: "student" },
  { id: "college", label: "College/University (19-24)", value: "college" },
  { id: "earlyCareer", label: "Early Career (25-34)", value: "earlyCareer" },
  { id: "midCareer", label: "Mid Career (35-44)", value: "midCareer" },
  { id: "lateCareer", label: "Late Career (45+)", value: "lateCareer" },
  { id: "careerChange", label: "Career Change (Any age)", value: "careerChange" },
]

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [predictionsCount, setPredictionsCount] = useState(0)
  const { toast } = useToast()
  const { status } = useSession()
  const router = useRouter()

  // Form state
  const [currentStep, setCurrentStep] = useState(0)
  const [ageGroup, setAgeGroup] = useState<string>("")
  const [formData, setFormData] = useState({
    // Common fields
    ageGroup: "",
    education: "",
    hobbies: "",
    skills: "",
    interests: "",
    workStyle: "",

    // Student specific
    favoriteSubjects: "",
    extracurriculars: "",

    // College specific
    major: "",
    minors: "",
    internships: "",

    // Career specific
    workExperience: "",
    achievements: "",
    certifications: "",
    languages: "",

    // Career change specific
    reasonForChange: "",
    transferableSkills: "",
    desiredWorkEnvironment: "",
  })

  const [result, setResult] = useState<{
    iq: number
    professions: string[]
    details: { title: string; match: number; description: string }[]
  } | null>(null)

  // Reset form and start over
  const resetForm = () => {
    setFormData({
      ageGroup: "",
      education: "",
      hobbies: "",
      skills: "",
      interests: "",
      workStyle: "",
      favoriteSubjects: "",
      extracurriculars: "",
      major: "",
      minors: "",
      internships: "",
      workExperience: "",
      achievements: "",
      certifications: "",
      languages: "",
      reasonForChange: "",
      transferableSkills: "",
      desiredWorkEnvironment: "",
    })
    setAgeGroup("")
    setCurrentStep(0)
    setResult(null)
    setError(null)
  }

  // Fetch guest predictions count on component mount
  useState(() => {
    const fetchPredictionsCount = async () => {
      if (status === "unauthenticated") {
        try {
          const response = await fetch("/api/guest/predictions-count")
          if (response.ok) {
            const data = await response.json()
            setPredictionsCount(data.count)
          }
        } catch (error) {
          console.error("Error fetching predictions count:", error)
        }
      }
    }
    fetchPredictionsCount()
  })

  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle age group selection
  const handleAgeGroupSelect = (value: string) => {
    setAgeGroup(value)
    handleChange("ageGroup", value)
    setCurrentStep(1)
  }

  // Get questions based on age group and current step
  const getQuestions = () => {
    // Common questions for all age groups
    if (currentStep === 1) {
      return [
        {
          id: "education",
          label: "What is your highest level of education?",
          type: "select",
          options: [
            { value: "highSchool", label: "High School" },
            { value: "someCollege", label: "Some College" },
            { value: "associates", label: "Associate's Degree" },
            { value: "bachelors", label: "Bachelor's Degree" },
            { value: "masters", label: "Master's Degree" },
            { value: "doctorate", label: "Doctorate" },
            { value: "professional", label: "Professional Degree" },
            { value: "selfTaught", label: "Self-Taught" },
          ],
        },
        {
          id: "hobbies",
          label: "What are your hobbies and activities you enjoy in your free time?",
          type: "textarea",
          placeholder: "E.g., reading, playing guitar, hiking, coding, cooking...",
        },
      ]
    }

    if (currentStep === 2) {
      return [
        {
          id: "skills",
          label: "What skills do you possess? Include both technical and soft skills.",
          type: "textarea",
          placeholder: "E.g., programming in Python, public speaking, problem-solving, leadership...",
        },
        {
          id: "interests",
          label: "What topics, fields, or activities are you most interested in?",
          type: "textarea",
          placeholder: "E.g., technology, healthcare, arts, science, business, helping others...",
        },
      ]
    }

    if (currentStep === 3) {
      return [
        {
          id: "workStyle",
          label: "How do you prefer to work?",
          type: "select",
          options: [
            { value: "remote", label: "Remote Work" },
            { value: "office", label: "Office-Based" },
            { value: "hybrid", label: "Hybrid" },
            { value: "flexible", label: "Flexible Hours" },
            { value: "structured", label: "Structured Environment" },
            { value: "collaborative", label: "Team-Based/Collaborative" },
            { value: "independent", label: "Independent/Self-Directed" },
          ],
        },
      ]
    }

    // Age-specific questions
    if (currentStep === 4) {
      switch (ageGroup) {
        case "student":
          return [
            {
              id: "favoriteSubjects",
              label: "What are your favorite subjects in school?",
              type: "textarea",
              placeholder: "E.g., mathematics, biology, literature, art, computer science...",
            },
            {
              id: "extracurriculars",
              label: "What extracurricular activities are you involved in?",
              type: "textarea",
              placeholder: "E.g., sports teams, clubs, volunteer work, student government...",
            },
          ]

        case "college":
          return [
            {
              id: "major",
              label: "What is your major or field of study?",
              type: "input",
              placeholder: "E.g., Computer Science, Business, Psychology...",
            },
            {
              id: "minors",
              label: "Do you have any minors or secondary fields of study?",
              type: "input",
              placeholder: "E.g., Mathematics, Economics, Art...",
            },
            {
              id: "internships",
              label: "Have you completed any internships or work experiences?",
              type: "textarea",
              placeholder: "Describe any internships, part-time jobs, or relevant experiences...",
            },
          ]

        case "earlyCareer":
        case "midCareer":
        case "lateCareer":
          return [
            {
              id: "workExperience",
              label: "Describe your work experience so far",
              type: "textarea",
              placeholder: "Include roles, responsibilities, industries, and years of experience...",
            },
            {
              id: "achievements",
              label: "What are your key professional achievements?",
              type: "textarea",
              placeholder: "Projects completed, awards, promotions, or other accomplishments...",
            },
            {
              id: "certifications",
              label: "Do you have any professional certifications or specialized training?",
              type: "textarea",
              placeholder: "List any certifications, courses, or specialized training you've completed...",
            },
          ]

        case "careerChange":
          return [
            {
              id: "reasonForChange",
              label: "Why are you considering a career change?",
              type: "textarea",
              placeholder: "E.g., seeking more fulfillment, better work-life balance, new challenges...",
            },
            {
              id: "transferableSkills",
              label: "What transferable skills do you have from your current/previous career?",
              type: "textarea",
              placeholder: "Skills that could be valuable in a different field or industry...",
            },
            {
              id: "desiredWorkEnvironment",
              label: "What type of work environment are you looking for in your new career?",
              type: "textarea",
              placeholder: "Describe your ideal workplace culture, values, and environment...",
            },
          ]

        default:
          return []
      }
    }

    // Final step for all age groups
    if (currentStep === 5) {
      return [
        {
          id: "languages",
          label: "What languages do you speak?",
          type: "textarea",
          placeholder: "E.g., English (native), Spanish (intermediate), French (basic)...",
        },
      ]
    }

    return []
  }

  // Get total number of steps based on age group
  const getTotalSteps = () => {
    return 6 // Age group selection + 5 question steps
  }

  // Calculate progress percentage
  const getProgressPercentage = () => {
    return ((currentStep + 1) / getTotalSteps()) * 100
  }

  // Validate current step
  const validateCurrentStep = () => {
    const questions = getQuestions()

    // Age group selection
    if (currentStep === 0 && !ageGroup) {
      toast({
        title: "Please select an age group",
        description: "This helps us provide more relevant career suggestions",
        variant: "destructive",
      })
      return false
    }

    // For other steps, check if required fields are filled
    for (const question of questions) {
      const value = formData[question.id as keyof typeof formData]
      if (!value || value.trim() === "") {
        toast({
          title: "Missing Information",
          description: `Please answer the question: ${question.label}`,
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < getTotalSteps() - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/suggestProfession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.limitReached) {
          toast({
            title: "Prediction Limit Reached",
            description: "You've reached the guest prediction limit. Please sign up for unlimited predictions.",
            variant: "destructive",
          })
          router.push("/signUp")
          return
        }
        throw new Error(errorData.error || "Failed to get career suggestions")
      }

      const data = await response.json()
      if (!data.iq || !data.professions || !data.details) {
        throw new Error("Invalid response format")
      }

      setResult(data)
      setCurrentStep(getTotalSteps()) // Move to results step

      // Update predictions count for guest users
      if (status === "unauthenticated") {
        setPredictionsCount((prev) => prev + 1)
      }

      toast({
        title: "Analysis Complete",
        description: "Your career suggestions are ready!",
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get career suggestions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Format description text for better readability
  const formatDescription = (text: string) => {
    // Replace bullet points with proper HTML
    let formatted = text
      .replace(/•\s+/g, "• ")
      .replace(/\n-\s+/g, "\n• ")
      .replace(/\n\s*\n/g, "\n\n")
      .replace(/:\s+/g, ": ")

    // Split by sections
    const sections = [
      "Skills Alignment",
      "Growth Potential",
      "Work-Life Balance",
      "Required Skills",
      "Salary Range",
      "Career Progression",
      "Next Steps",
    ]

    sections.forEach((section) => {
      formatted = formatted.replace(new RegExp(`${section}:`, "g"), `\n\n**${section}:**`)
    })

    return formatted
  }

  // Render question based on type
  const renderQuestion = (question: any) => {
    switch (question.type) {
      case "textarea":
        return (
          <Textarea
            id={question.id}
            placeholder={question.placeholder}
            className="min-h-[120px]"
            value={formData[question.id as keyof typeof formData] as string}
            onChange={(e) => handleChange(question.id, e.target.value)}
          />
        )

      case "input":
        return (
          <Input
            id={question.id}
            placeholder={question.placeholder}
            value={formData[question.id as keyof typeof formData] as string}
            onChange={(e) => handleChange(question.id, e.target.value)}
          />
        )

      case "select":
        return (
          <Select
            value={formData[question.id as keyof typeof formData] as string}
            onValueChange={(value) => handleChange(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select your ${question.id}`} />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Hero Section */}
      <section className="px-4 py-12 md:py-20 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Discover Your <span className="text-primary">Perfect Career</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 text-sm md:text-base lg:text-lg xl:text-xl">
            Let AI analyze your profile and suggest the ideal career path tailored just for you
          </p>
        </motion.div>

        {/* Badges - Stack on mobile */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
          <Badge variant="outline" className="text-xs sm:text-sm py-2 px-4">
            <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            AI-Powered Analysis
          </Badge>
          <Badge variant="outline" className="text-xs sm:text-sm py-2 px-4">
            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Personalized Suggestions
          </Badge>
          <Badge variant="outline" className="text-xs sm:text-sm py-2 px-4">
            <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Career Guidance
          </Badge>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="container mx-auto px-4 py-6 md:py-10">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="space-y-2 text-center sm:text-left">
            <CardTitle className="text-2xl sm:text-3xl">Career Profile Analysis</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {currentStep < getTotalSteps()
                ? "Answer a few questions to get personalized career suggestions"
                : "Your personalized career analysis based on your profile"}
            </CardDescription>
            {status === "unauthenticated" && <GuestAlert predictionsCount={predictionsCount} maxPredictions={3} />}
          </CardHeader>

          {/* Progress bar */}
          {currentStep < getTotalSteps() && (
            <div className="px-6">
              <Progress value={getProgressPercentage()} className="h-2" />
              <p className="text-xs text-muted-foreground text-right mt-1">
                Step {currentStep + 1} of {getTotalSteps()}
              </p>
            </div>
          )}

          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Age group selection */}
            {currentStep === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select your current life stage:</h3>
                  <p className="text-sm text-muted-foreground">
                    This helps us tailor our questions and career suggestions to your specific situation.
                  </p>

                  <RadioGroup
                    value={ageGroup}
                    onValueChange={handleAgeGroupSelect}
                    className="grid gap-4 md:grid-cols-2 pt-2"
                  >
                    {AGE_GROUPS.map((group) => (
                      <div key={group.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={group.value} id={group.id} />
                        <Label htmlFor={group.id} className="cursor-pointer">
                          {group.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {/* Question steps */}
            {currentStep > 0 && currentStep < getTotalSteps() && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {getQuestions().map((question) => (
                  <div key={question.id} className="space-y-3">
                    <Label htmlFor={question.id} className="text-base font-medium">
                      {question.label}
                    </Label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Results */}
            {currentStep === getTotalSteps() && result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-800 dark:text-amber-300">Important Disclaimer</AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    <p className="mb-2">The career suggestions and IQ estimate provided are:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Based solely on the information you&apos;ve provided in this questionnaire</li>
                      <li>Not a substitute for professional career counseling or psychometric testing</li>
                      <li>Intended as exploratory guidance rather than definitive assessment</li>
                      <li>Limited by the AI&apos;s understanding of your unique circumstances</li>
                      <li>
                        Not considering all factors that influence career success (like local job markets, economic
                        conditions, etc.)
                      </li>
                    </ul>
                    <p className="mt-2">
                      We recommend using these insights as a starting point for further research and exploration.
                    </p>
                  </AlertDescription>
                </Alert>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Career Details</TabsTrigger>
                    <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            IQ Level Estimate
                          </CardTitle>
                          <CardDescription>Based on your profile analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <span className="text-5xl font-bold text-primary">{result.iq}</span>
                            <p className="text-sm text-muted-foreground mt-2">Estimated IQ Range</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            Top Career Matches
                          </CardTitle>
                          <CardDescription>Recommended career paths</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {result.professions?.map((profession, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Badge variant="secondary">{index + 1}</Badge>
                                {profession}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="details">
                    <div className="space-y-4">
                      {result.details?.map((detail, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle>{detail.title}</CardTitle>
                              <Badge variant="secondary">Match: {detail.match}%</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none">
                              {formatDescription(detail.description)
                                .split("\n\n")
                                .map((paragraph, i) => (
                                  <p key={i} className="mb-2">
                                    {paragraph.startsWith("**") ? (
                                      <>
                                        <strong>{paragraph.substring(2, paragraph.indexOf(":**"))}</strong>
                                        {paragraph.substring(paragraph.indexOf(":**") + 3)}
                                      </>
                                    ) : (
                                      paragraph
                                    )}
                                  </p>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="next-steps">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recommended Next Steps</CardTitle>
                        <CardDescription>Follow these steps to pursue your career path</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {result.details?.map((detail, index) => (
                            <div key={index} className="space-y-2">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <Badge>{index + 1}</Badge> {detail.title}
                              </h4>
                              <ul className="list-disc list-inside space-y-1 pl-4">
                                <li>
                                  Complete relevant certifications or courses in {detail.title.toLowerCase()} field
                                </li>
                                <li>Build a portfolio showcasing your skills and projects</li>
                                <li>Network with professionals in this industry through LinkedIn or industry events</li>
                              </ul>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-center">
                  <Button variant="outline" onClick={resetForm}>
                    Start New Analysis
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>

          {/* Navigation buttons */}
          {currentStep > 0 && currentStep < getTotalSteps() && (
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep} disabled={loading}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <Button onClick={handleNextStep} disabled={loading}>
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : currentStep === getTotalSteps() - 1 ? (
                  "Get Results"
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <CardTitle className="text-lg sm:text-xl">AI-Powered Analysis</CardTitle>
              <CardDescription className="text-sm">
                Advanced algorithms analyze your profile to provide accurate career suggestions
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="flex flex-col h-full">
            <CardHeader>
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Personalized Matches</CardTitle>
              <CardDescription className="text-sm">
                Get career suggestions tailored to your unique combination of skills, experiences, and interests
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="flex flex-col h-full">
            <CardHeader>
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Career Guidance</CardTitle>
              <CardDescription className="text-sm">
                Receive detailed insights and next steps to pursue your ideal career path
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  )
}


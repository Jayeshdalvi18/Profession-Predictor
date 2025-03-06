"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Brain, Briefcase, GraduationCap, Heart, AlertCircle, Info, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { GuestAlert } from "@/components/guest-alert"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [predictionsCount, setPredictionsCount] = useState(0)
  const { toast } = useToast()
  const { status } = useSession()
  const router = useRouter()
  const [userBio, setUserBio] = useState("")
  const [showForm, setShowForm] = useState(true)
  const [result, setResult] = useState<{
    iq: number
    professions: string[]
    details: { title: string; match: number; description: string }[]
  } | null>(null)

  // Reset form and start over
  const resetForm = () => {
    setUserBio("")
    setShowForm(true)
    setResult(null)
    setError(null)
  }

  // Fetch guest predictions count on component mount
  useState(() => {
    const fetchPredictionsCount = async () => {
      if (status === "unauthenticated") {
        try {
          const response = await fetch("/api/predictions-count")
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

  const validateForm = () => {
    if (!userBio.trim() || userBio.length < 30) {
      toast({
        title: "Insufficient Information",
        description:
          "Please provide a detailed description of yourself (at least 100 characters) for accurate analysis.",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/suggestProfession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userBio }),
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
      setShowForm(false)

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
            Let AI analyze your life experiences and suggest the ideal career path tailored just for you
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
              {showForm
                ? "Tell us about your life experiences to get personalized career suggestions"
                : "Your personalized career analysis based on your life experiences"}
            </CardDescription>
            {status === "unauthenticated" && <GuestAlert predictionsCount={predictionsCount} maxPredictions={3} />}
          </CardHeader>
          <CardContent>
            {showForm ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>How to get accurate results</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">For the most accurate career predictions, please include details about:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your educational background and qualifications</li>
                        <li>Skills you've developed (technical and soft skills)</li>
                        <li>Hobbies and activities you enjoy</li>
                        <li>Work experiences (if any)</li>
                        <li>Your interests and passions</li>
                        <li>How you prefer to work (team/solo, structured/flexible)</li>
                        <li>Languages you speak</li>
                        <li>Any certifications you have</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Textarea
                    placeholder="Tell us about yourself in detail. Include your education, skills, hobbies, work experiences, interests, and how you prefer to work..."
                    className="min-h-[250px]"
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Get Career Suggestions"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                    <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-800 dark:text-amber-300">Important Disclaimer</AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-400">
                      <p className="mb-2">The career suggestions and IQ estimate provided are:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Based solely on the text information you've provided</li>
                        <li>Not a substitute for professional career counseling or psychometric testing</li>
                        <li>Intended as exploratory guidance rather than definitive assessment</li>
                        <li>Limited by the AI's understanding of your unique circumstances</li>
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
                                  <li>
                                    Network with professionals in this industry through LinkedIn or industry events
                                  </li>
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
              )
            )}
          </CardContent>
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
                Advanced algorithms analyze your life experiences to provide accurate career suggestions
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


"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Brain, Briefcase, GraduationCap, Heart, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    hobbies: "",
    skills: "",
    education: "",
    interests: "",
    workStyle: "",
  })
  const [result, setResult] = useState<{
    iq: number
    professions: string[]
    details: { title: string; match: number; description: string }[]
  } | null>(null)

  const validateForm = () => {
    if (step === 1) {
      if (!formData.hobbies.trim() || !formData.skills.trim()) {
        toast({
          title: "Missing Information",
          description: "Please fill in both hobbies and skills fields",
          variant: "destructive",
        })
        return false
      }
    } else if (step === 2) {
      if (!formData.education || !formData.workStyle || !formData.interests.trim()) {
        toast({
          title: "Missing Information",
          description: "Please fill in all fields before proceeding",
          variant: "destructive",
        })
        return false
      }
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to get career suggestions")
      }

      const data = await response.json()
      if (!data.professions || !data.details) {
        throw new Error("Invalid response format")
      }

      setResult(data)
      setStep(3)
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

  const nextStep = () => {
    if (validateForm()) {
      setStep(step + 1)
    }
  }

  const prevStep = () => setStep(step - 1)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Hero Section - Improved responsiveness */}
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

      {/* Main Form Section - Improved padding and spacing */}
      <section className="container mx-auto px-4 py-6 md:py-10">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="space-y-2 text-center sm:text-left">
            <CardTitle className="text-2xl sm:text-3xl">Career Profile Analysis</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Tell us about yourself to get personalized career suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <Progress value={step * 33.33} className="h-2" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-4">
                    <Label>What are your hobbies?</Label>
                    <Textarea
                      placeholder="E.g., programming, reading, playing music..."
                      className="min-h-[100px]"
                      value={formData.hobbies}
                      onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>What skills do you possess?</Label>
                    <Textarea
                      placeholder="E.g., problem-solving, communication, leadership..."
                      className="min-h-[100px]"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={nextStep}>Next Step</Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-4">
                    <Label>Education Level</Label>
                    <Select
                      value={formData.education}
                      onValueChange={(value) => setFormData({ ...formData, education: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="bachelors">Bachelor&apos;s Degree</SelectItem>
                        <SelectItem value="masters">Master&apos;s Degree</SelectItem>
                        <SelectItem value="phd">Ph.D.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Preferred Work Style</Label>
                    <Select
                      value={formData.workStyle}
                      onValueChange={(value) => setFormData({ ...formData, workStyle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your preferred work style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote Work</SelectItem>
                        <SelectItem value="office">Office Based</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Areas of Interest</Label>
                    <Textarea
                      placeholder="E.g., technology, healthcare, education..."
                      className="min-h-[100px]"
                      value={formData.interests}
                      onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Get Results"
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
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
                              <CardTitle>{detail.title}</CardTitle>
                              <CardDescription>Match Score: {detail.match}%</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p>{detail.description}</p>
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
                          <ul className="space-y-4">
                            <li className="flex items-start gap-2">
                              <Badge>1</Badge>
                              <div>
                                <h4 className="font-semibold">Research Your Top Matches</h4>
                                <p className="text-sm text-muted-foreground">
                                  Learn more about the day-to-day responsibilities and requirements
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Badge>2</Badge>
                              <div>
                                <h4 className="font-semibold">Skill Development</h4>
                                <p className="text-sm text-muted-foreground">
                                  Identify and work on key skills needed for your chosen career
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Badge>3</Badge>
                              <div>
                                <h4 className="font-semibold">Network & Connect</h4>
                                <p className="text-sm text-muted-foreground">
                                  Join professional communities and connect with people in your field
                                </p>
                              </div>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-center">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Start New Analysis
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Features Section - Improved grid responsiveness */}
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
                Get career suggestions tailored to your unique combination of skills and interests
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


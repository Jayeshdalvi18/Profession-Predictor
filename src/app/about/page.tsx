import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Brain, GraduationCap, Users } from "lucide-react"

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">About Profession Predictor</CardTitle>
          <CardDescription>Empowering your career decisions with AI-driven insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Profession Predictor is an innovative platform that leverages the power of artificial intelligence to help
            individuals discover their ideal career paths. Our mission is to provide personalized career guidance and
            insights, empowering you to make informed decisions about your professional future.
          </p>
          <p>
            Founded by a team of career experts and AI enthusiasts, Profession Predictor combines cutting-edge
            technology with deep industry knowledge to analyze your skills, interests, and experiences. We then match
            you with potential career options that align with your unique profile.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <Brain className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>AI-Powered Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            Our advanced algorithms process your profile data to provide accurate and personalized career suggestions.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Briefcase className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Comprehensive Insights</CardTitle>
          </CardHeader>
          <CardContent>
            Get detailed information about potential careers, including skills match, growth potential, and salary
            ranges.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <GraduationCap className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Continuous Learning</CardTitle>
          </CardHeader>
          <CardContent>
            We regularly update our AI models and career databases to ensure you receive the most relevant and
            up-to-date suggestions.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Expert Team</CardTitle>
          </CardHeader>
          <CardContent>
            Our team consists of career counselors, data scientists, and industry professionals dedicated to your
            success.
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Our Commitment</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            At Profession Predictor, we&apos;re committed to continuous improvement and innovation. We understand that your
            career journey is unique, and our tool is designed to support and guide you along the way. While our
            AI-powered suggestions are insightful and thought-provoking, we always encourage users to consider these
            recommendations as starting points for further exploration and research.
          </p>
          <p className="mt-4">
            Thank you for choosing Profession Predictor. We&apos;re excited to be part of your career discovery journey!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


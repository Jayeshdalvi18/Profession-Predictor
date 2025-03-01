import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
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
          <p>
            While our AI-powered suggestions are designed to be insightful and thought-provoking, we always encourage
            users to consider these recommendations as starting points for further exploration and research. Your career
            journey is unique, and our tool is here to support and guide you along the way.
          </p>
          <p>
            At Profession Predictor, we&apos;re committed to continuous improvement and innovation. We regularly update our
            AI models and career databases to ensure you receive the most relevant and up-to-date suggestions possible.
          </p>
          <p>Thank you for choosing Profession Predictor. We&apos;re excited to be part of your career discovery journey!</p>
        </CardContent>
      </Card>
    </div>
  )
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CareerDetail } from "@/types/form"

export function CareerDetailCard({ title, match, description }: CareerDetail) {
  // Function to format the description into sections
  const formatDescription = (text: string): string[] => {
    const sections = [
      "Skills Alignment",
      "Growth Potential",
      "Work-Life Balance",
      "Required Skills",
      "Salary Range",
      "Career Progression",
    ]

    let formattedContent = text
    sections.forEach((section) => {
      formattedContent = formattedContent.replace(new RegExp(`${section}:`, "g"), `\n${section}:\n`)
    })

    return formattedContent.split("\n").filter((line) => line.trim())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Badge variant="secondary">Match: {match}%</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {formatDescription(description).map((line, index) => {
            const isHeader = line.endsWith(":")
            return (
              <div key={index} className={isHeader ? "font-semibold mt-4" : "ml-4"}>
                {line}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


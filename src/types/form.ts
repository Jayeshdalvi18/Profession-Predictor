export interface FormData {
  // Common fields
  ageGroup: string
  education: string
  hobbies: string
  skills: string
  interests: string
  workStyle: string
  projectUrl: string

  // Student specific
  favoriteSubjects: string
  extracurriculars: string
  careerGoals?: string
  mentorshipInterest?: string

  // College specific
  major: string
  minors: string
  internships: string
  academicInterests?: string

  // Career specific
  workExperience: string
  achievements: string
  certifications: string
  languages: string
  careerAspirations?: string
  careerChallenges?: string
  workLifeBalance?: string

  // Late career specific
  futureGoals?: string
  legacyInterests?: string

  // Career change specific
  reasonForChange: string
  transferableSkills: string
  desiredWorkEnvironment: string
  newFieldInterests?: string
  retrainingWillingness?: string
}

export interface QuestionOption {
  value: string
  label: string
}

export interface Question {
  id: keyof FormData
  label: string
  type: "textarea" | "input" | "select" | "url"
  placeholder?: string
  options?: { value: string, label: string }[]
}

export interface CareerDetail {
  title: string
  match: number
  description: string
}

export interface CareerResult {
  iq: number
  professions: string[]
  details: CareerDetail[]
}


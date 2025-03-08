export interface FormData {
    // Common fields
    ageGroup: string
    education: string
    hobbies: string
    skills: string
    interests: string
    workStyle: string
    projectUrl: string // New field for project/portfolio URL
  
    // Student specific
    favoriteSubjects: string
    extracurriculars: string
  
    // College specific
    major: string
    minors: string
    internships: string
  
    // Career specific
    workExperience: string
    achievements: string
    certifications: string
    languages: string
  
    // Career change specific
    reasonForChange: string
    transferableSkills: string
    desiredWorkEnvironment: string
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
    options?: QuestionOption[]
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
  
  
import { Bell, FileText, ThumbsUp, Users } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  icon: "bell" | "file-text" | "thumbs-up" | "users"
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  const Icon = (): JSX.Element => {
    switch (icon) {
      case "bell":
        return <Bell className="h-12 w-12 text-gray-500" />
      case "file-text":
        return <FileText className="h-12 w-12 text-gray-500" />
      case "thumbs-up":
        return <ThumbsUp className="h-12 w-12 text-gray-500" />
      case "users":
        return <Users className="h-12 w-12 text-gray-500" />
      default:
        return <Bell className="h-12 w-12 text-gray-500" />
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-gray-900/50 p-4 mb-4">
        <Icon />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-gray-400 mt-1 text-center max-w-md">{description}</p>
    </div>
  )
}

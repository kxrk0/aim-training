import { AchievementDashboard } from '@/components/achievement/AchievementDashboard'

export function AchievementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900/20">
      <div className="container mx-auto px-4 py-8">
        <AchievementDashboard />
      </div>
    </div>
  )
} 
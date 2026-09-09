import { LeaderboardPodium } from "@/components/ui/leaderboard-podium"

export default function LeaderboardPodiumDemo() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <LeaderboardPodium
        rankings={[
          { userId: "1", userName: "Ava Elizabeth Turner", rank: 1, value: 2500, avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80&fit=crop" },
          { userId: "2", userName: "Leo Harrison", rank: 2, value: 2200, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&q=80&fit=crop" },
          { userId: "3", userName: "Rowan Elijah", rank: 3, value: 1800, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80&fit=crop" },
        ]}
      />
    </div>
  )
}

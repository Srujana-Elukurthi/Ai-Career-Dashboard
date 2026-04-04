import { Trophy, Star, Zap, Award, Target, Code, Brain, BookOpen, ArrowLeft } from "lucide-react";

interface BadgeSystemProps {
  onNavigate: (page: string) => void;
  profileData: any;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: string;
  progress?: number;
  target?: number;
}

export function BadgeSystem({ onNavigate, profileData }: BadgeSystemProps) {
  const badges: Badge[] = [
    {
      id: "1",
      name: "First Steps",
      description: "Complete your profile",
      icon: "star",
      earned: true,
      earnedDate: "Feb 1, 2026",
      rarity: "common",
      category: "Getting Started"
    },
    {
      id: "2",
      name: "Coding Novice",
      description: "Solve 10 coding problems",
      icon: "code",
      earned: true,
      earnedDate: "Feb 3, 2026",
      rarity: "common",
      category: "Coding"
    },
    {
      id: "3",
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "zap",
      earned: true,
      earnedDate: "Feb 5, 2026",
      rarity: "rare",
      category: "Consistency"
    },
    {
      id: "4",
      name: "Interview Ready",
      description: "Complete 5 mock interviews",
      icon: "brain",
      earned: true,
      earnedDate: "Feb 8, 2026",
      rarity: "rare",
      category: "Interview"
    },
    {
      id: "5",
      name: "Coding Master",
      description: "Solve 100 coding problems",
      icon: "trophy",
      earned: false,
      rarity: "epic",
      category: "Coding",
      progress: 47,
      target: 100
    },
    {
      id: "6",
      name: "Streak Legend",
      description: "Maintain a 30-day streak",
      icon: "zap",
      earned: false,
      rarity: "epic",
      category: "Consistency",
      progress: 15,
      target: 30
    },
    {
      id: "7",
      name: "Resume Expert",
      description: "Achieve 90%+ resume score",
      icon: "target",
      earned: false,
      rarity: "rare",
      category: "Profile",
      progress: 78,
      target: 90
    },
    {
      id: "8",
      name: "Knowledge Seeker",
      description: "Complete 20 learning modules",
      icon: "book",
      earned: false,
      rarity: "rare",
      category: "Learning",
      progress: 12,
      target: 20
    },
    {
      id: "9",
      name: "FAANG Ready",
      description: "Achieve 90%+ placement readiness",
      icon: "award",
      earned: false,
      rarity: "legendary",
      category: "Achievement",
      progress: 72,
      target: 90
    },
    {
      id: "10",
      name: "Ultimate Champion",
      description: "Earn all other badges",
      icon: "trophy",
      earned: false,
      rarity: "legendary",
      category: "Achievement",
      progress: 4,
      target: 8
    }
  ];

  const earnedBadges = badges.filter((b) => b.earned);
  const totalBadges = badges.length;
  const completionRate = Math.round((earnedBadges.length / totalBadges) * 100);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-500";
      case "rare":
        return "from-blue-400 to-blue-600";
      case "epic":
        return "from-purple-400 to-purple-600";
      case "legendary":
        return "from-yellow-400 to-orange-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300";
      case "rare":
        return "border-blue-300";
      case "epic":
        return "border-purple-300";
      case "legendary":
        return "border-yellow-300";
      default:
        return "border-gray-300";
    }
  };

  const getIcon = (iconName: string, earned: boolean) => {
    const className = `w-8 h-8 ${earned ? "text-white" : "text-gray-400"}`;
    switch (iconName) {
      case "star":
        return <Star className={className} />;
      case "code":
        return <Code className={className} />;
      case "zap":
        return <Zap className={className} />;
      case "brain":
        return <Brain className={className} />;
      case "trophy":
        return <Trophy className={className} />;
      case "target":
        return <Target className={className} />;
      case "book":
        return <BookOpen className={className} />;
      case "award":
        return <Award className={className} />;
      default:
        return <Star className={className} />;
    }
  };

  const categorizedBadges = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const stats = [
    { label: "Total Badges", value: earnedBadges.length, total: totalBadges },
    { label: "Common", value: earnedBadges.filter((b) => b.rarity === "common").length },
    { label: "Rare", value: earnedBadges.filter((b) => b.rarity === "rare").length },
    { label: "Epic", value: earnedBadges.filter((b) => b.rarity === "epic").length },
    { label: "Legendary", value: earnedBadges.filter((b) => b.rarity === "legendary").length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <span className="font-semibold text-xl">Badge Collection</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Overview */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Achievement Journey</h2>
              <p className="text-blue-100">
                Keep earning badges to unlock new levels and rewards
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{completionRate}%</div>
              <div className="text-blue-100 text-sm">Complete</div>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">
                {stat.value}
                {stat.total && <span className="text-gray-400">/{stat.total}</span>}
              </div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Badges by Category */}
        <div className="space-y-8">
          {Object.entries(categorizedBadges).map(([category, categoryBadges]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`bg-white rounded-xl border-2 ${getRarityBorder(
                      badge.rarity
                    )} p-6 transition-all ${
                      badge.earned ? "shadow-lg" : "opacity-75"
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getRarityColor(
                          badge.rarity
                        )} flex items-center justify-center flex-shrink-0 ${
                          !badge.earned && "grayscale"
                        }`}
                      >
                        {getIcon(badge.icon, badge.earned)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{badge.name}</h4>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                      </div>
                    </div>

                    {badge.earned ? (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-sm text-green-600 font-medium">✓ Earned</span>
                        <span className="text-xs text-gray-500">{badge.earnedDate}</span>
                      </div>
                    ) : (
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium text-gray-800">
                            {badge.progress}/{badge.target}
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                badge.progress && badge.target
                                  ? (badge.progress / badge.target) * 100
                                  : 0
                              }%`
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Rarity Badge */}
                    <div className="mt-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          badge.rarity === "common"
                            ? "bg-gray-100 text-gray-700"
                            : badge.rarity === "rare"
                            ? "bg-blue-100 text-blue-700"
                            : badge.rarity === "epic"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {badge.rarity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Next Badge to Earn */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">🎯 Next Badge to Earn</h3>
          <p className="text-blue-700">
            You're closest to earning <strong>Resume Expert</strong> - Just improve your resume
            score by 12% more!
          </p>
        </div>
      </main>
    </div>
  );
}

import { useState, useCallback } from "react";
import { Flame, Target, Calendar, TrendingUp, Award, ArrowLeft, Check, Search } from "lucide-react";

interface ProgressTrackerProps {
  onNavigate: (page: string) => void;
  profileData: any;
}

interface DailyGoal {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

export function ProgressTracker({ onNavigate, profileData }: ProgressTrackerProps) {
  const [username, setUsername] = useState(profileData?.leetcode_username || "");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([
    { id: "1", title: "Solve 3 LeetCode problems", completed: false, category: "Coding" },
    { id: "2", title: "Study System Design for 30 mins", completed: true, category: "Learning" },
    { id: "3", title: "Practice 1 Mock Interview", completed: false, category: "Interview" },
    { id: "4", title: "Read 1 tech article", completed: true, category: "Learning" }
  ]);

  const fetchStats = useCallback(async () => {
    if (loading) return;
    if (!username.trim()) {
      setError("Please enter a valid LeetCode username.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:8000/leetcode/${username}`);
      if (!response.ok) {
        throw new Error("Failed to fetch data or user not found.");
      }

      const data = await response.json();

      if (data.error_msg) {
        setTimeout(() => {
          setError(data.error_msg);
          setLoading(false);
        }, 300);
        return;
      }

      setTimeout(() => {
        setStats(data);

        // Dynamic daily goal computation based on today's submission count
        const todayCount = data.recent_activity && data.recent_activity.length > 0 ? data.recent_activity[0].count : 0;
        setDailyGoals(prev => prev.map(g => g.id === "1" ? { ...g, completed: todayCount >= 3 } : g));

        setLoading(false);
      }, 300);
    } catch (err: any) {
      setTimeout(() => {
        setError(err.message || "An error occurred");
        setLoading(false);
      }, 300);
    }
  }, [username, loading]);

  const completedGoals = dailyGoals.filter((g) => g.completed).length;
  const goalCompletionRate = Math.round((completedGoals / dailyGoals.length) * 100);

  // Safely map calendar 60 days if available, else empty
  const calendarData = stats?.recent_activity_60
    ? [...stats.recent_activity_60].reverse().map((d: any) => ({
      date: d.date,
      active: d.count > 0,
      count: d.count
    }))
    : [];

  const weeklyStats = stats?.recent_activity
    ? [...stats.recent_activity].reverse().map((d: any) => {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dateObj = new Date(d.date);
      return {
        day: dayNames[dateObj.getUTCDay()],
        activities: d.count
      };
    })
    : [];

  const maxActivities = weeklyStats.length > 0 ? Math.max(...weeklyStats.map(s => s.activities)) : 10;

  const toggleGoal = (goalId: string) => {
    setDailyGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  // Milestones Engine
  const m1 = stats ? stats.current_streak >= 10 : false;
  const m2 = stats ? stats.total >= 50 : false;
  const m3 = stats ? stats.current_streak >= 30 : false;
  const m4 = stats ? stats.total >= 100 : false;

  const milestones = [
    { title: "First Week Complete", achieved: true, date: "Unlocked" },
    { title: "10 Day Streak", achieved: m1, date: m1 ? "Achieved" : "Locked" },
    { title: "50 Problems Solved", achieved: m2, date: m2 ? "Achieved" : "Locked" },
    { title: "30 Day Streak", achieved: m3, date: m3 ? "Achieved" : "Locked" },
    { title: "100 Problems Solved", achieved: m4, date: m4 ? "Achieved" : "Locked" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <Flame className="w-6 h-6 text-orange-600" />
              <span className="font-semibold text-xl">Progress Tracker</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">

        {/* Username Sync Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LeetCode Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username (e.g., neetcode)"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                  onKeyDown={(e) => e.key === "Enter" && fetchStats()}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <button
              onClick={fetchStats}
              disabled={!username.trim() || loading}
              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm font-medium"
            >
              {loading ? "Syncing..." : "Sync Progress"}
            </button>
          </div>
          {error && <div className="mt-3 text-sm text-red-600 font-medium">{error}</div>}
        </div>

        {!stats && !loading && !error && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Flame className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Sync your LeetCode profile to view your coding streaks, activity tracking, and dynamic problem-set milestones.
            </p>
          </div>
        )}

        {stats && (
          <>
            {/* Streak Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-8 h-8" />
                  <div>
                    <div className="text-sm opacity-90">Current Streak</div>
                    <div className="text-3xl font-bold">{stats.current_streak || 0} days</div>
                  </div>
                </div>
                <div className="text-sm opacity-90">
                  {stats.current_streak > 0 ? "Keep it up! You're on fire 🔥" : "Time to start a new streak!"}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Longest Streak</div>
                    <div className="text-3xl font-bold">{stats.max_streak || 0} days</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">Personal best calculation!</div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Solved</div>
                    <div className="text-3xl font-bold">{stats.total || 0}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-green-600 font-medium">{stats.easy || 0} E</span> /{" "}
                  <span className="text-yellow-500 font-medium">{stats.medium || 0} M</span> /{" "}
                  <span className="text-red-500 font-medium">{stats.hard || 0} H</span>
                </div>
              </div>
            </div>

            {/* Daily Goals & Overall Progress */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">Goal Checklist</h3>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-blue-600">{completedGoals}</span>
                    <span className="text-gray-600"> / {dailyGoals.length} completed</span>
                  </div>
                </div>

                <div className="mb-6 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${goalCompletionRate}%` }}
                  />
                </div>

                <div className="space-y-3">
                  {dailyGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                      onClick={() => toggleGoal(goal.id)}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${goal.completed
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300 bg-white"
                          }`}
                      >
                        {goal.completed && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium ${goal.completed ? "line-through text-gray-400" : "text-gray-800"
                            }`}
                        >
                          {goal.title}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                        {goal.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-lg">Overall Trajectory</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Problem Master Threshold (500 Target)</span>
                      <span className="text-sm font-bold text-gray-900">{Math.round((stats.total / 500) * 100)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((stats.total / 500) * 100, 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Easy Coverage</span>
                      <span className="text-sm font-bold text-green-600">{stats.easy} solved</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((stats.easy / 150) * 100, 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Medium Coverage</span>
                      <span className="text-sm font-bold text-yellow-500">{stats.medium} solved</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-400 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((stats.medium / 250) * 100, 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Hard Coverage</span>
                      <span className="text-sm font-bold text-red-500">{stats.hard} solved</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((stats.hard / 100) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Calendar */}
            {calendarData.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Activity Calendar</h3>
                <p className="text-sm text-gray-500 mb-6 font-medium">Your submission activity over the trailing 60 days</p>

                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-2 min-w-max">
                    {/* Render in chunks of 7 days (weeks) */}
                    {Array.from({ length: Math.ceil(calendarData.length / 7) }).map((_, colIndex) => (
                      <div key={colIndex} className="flex flex-col gap-2">
                        {calendarData.slice(colIndex * 7, (colIndex + 1) * 7).map((day: any, index: number) => (
                          <div
                            key={index}
                            className="group relative"
                            title={`${day.date}: ${day.count} submissions`}
                          >
                            <div
                              className={`w-5 h-5 rounded-sm transition-colors ${day.active
                                  ? day.count >= 4
                                    ? "bg-orange-600"
                                    : day.count >= 3
                                      ? "bg-orange-500"
                                      : day.count >= 2
                                        ? "bg-orange-400"
                                        : "bg-orange-300"
                                  : "bg-gray-100 border border-gray-200"
                                }`}
                            />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              {day.date}: {day.count} solved
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-6 text-sm text-gray-500 font-medium justify-end">
                    <span>Less</span>
                    <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded-sm" />
                    <div className="w-4 h-4 bg-orange-300 rounded-sm" />
                    <div className="w-4 h-4 bg-orange-500 rounded-sm" />
                    <div className="w-4 h-4 bg-orange-600 rounded-sm" />
                    <span>More</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Weekly Activity Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Submissions (7 Days)</h3>
                </div>
                {weeklyStats.length > 0 ? (
                  <div className="space-y-4">
                    {weeklyStats.map((stat: any, index: number) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-12 text-sm text-gray-600 font-medium">{stat.day}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-700"
                            style={{ width: `${(stat.activities / (maxActivities || 1)) * 100}%`, minWidth: stat.activities > 0 ? "2rem" : "0" }}
                          >
                            {stat.activities > 0 && <span className="text-white text-xs font-bold">{stat.activities}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No recent activity detected.</p>
                )}
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Dynamic Milestones</h3>
                </div>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${milestone.achieved ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"
                        }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${milestone.achieved
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-400 border border-gray-200"
                          }`}
                      >
                        {milestone.achieved ? (
                          <Award className="w-5 h-5" />
                        ) : (
                          <span className="text-lg">🔒</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-semibold ${milestone.achieved ? "text-green-900" : "text-gray-500"
                            }`}
                        >
                          {milestone.title}
                        </div>
                        <div
                          className={`text-sm font-medium ${milestone.achieved ? "text-green-700" : "text-gray-400"
                            }`}
                        >
                          {milestone.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

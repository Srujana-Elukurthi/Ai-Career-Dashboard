import { useState, useEffect, useCallback } from "react";
import { Code, Trophy, TrendingUp, Calendar, ArrowLeft, ExternalLink } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CodingScoreTrackerProps {
  onNavigate: (page: string) => void;
  profileData: any;
}

export function CodingScoreTracker({ onNavigate, profileData }: CodingScoreTrackerProps) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  const fetchCodingStats = useCallback(async () => {
    if (loading) return;
    if (!username.trim()) {
      setError("Please enter a valid LeetCode username.");
      return;
    }

    setLoading(true);
    setError("");
    setStats(null); // Clear previous stats so dashboard hides during loading/error

    try {
      const response = await fetch(`http://localhost:8000/leetcode/${username}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error_msg || "No username found on LeetCode");
      }


      const data = await response.json();

      if (data.error_msg) {
        setTimeout(() => {
          setError(data.error_msg);
          setLoading(false);
        }, 300);
        return;
      }

      const maxTopicCount = data.topics && data.topics.length > 0 ? Math.max(...data.topics.map((t: any) => t.count)) : 1;

      const updatedStats = {
        username: username,
        totalSolved: data.total,
        easySolved: data.easy,
        mediumSolved: data.medium,
        hardSolved: data.hard,
        acceptanceRate: 68.5,
        ranking: data.ranking || 0,
        streak: data.current_streak || 0,
        maxStreak: data.max_streak || 0,
        recentSubmissions: (data.recent_activity || []).map((a: any) => ({
          date: a.date,
          problems: a.count,
          accepted: a.count
        })),
        weeklyProgress: [
          { week: "Week 1", solved: 12 },
          { week: "Week 2", solved: 18 },
          { week: "Week 3", solved: 15 },
          { week: "Week 4", solved: 22 },
          { week: "Week 5", solved: 20 },
          { week: "Week 6", solved: 25 }
        ],
        topicWiseProgress: (data.topics || []).map((t: any) => ({
          topic: t.topic,
          solved: t.count,
          total: maxTopicCount
        }))
      };

      setTimeout(() => {
        setStats(updatedStats);
        setLoading(false);
      }, 300);
    } catch (err: any) {
      setTimeout(() => {
        setError(err.message || "An error occurred");
        setLoading(false);
      }, 300);
    }
  }, [username, loading, stats]);

  useEffect(() => {
    // Optionally fetch a default user so UI isn't empty, but waiting for input is better
  }, []);

  const totalProblems = 500;
  const solvedPercentage = stats ? Math.round((stats.totalSolved / totalProblems) * 100) : 0;

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
              <Code className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-xl">Coding Score Tracker</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Username Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Connect Your Coding Profile</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter LeetCode username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchCodingStats}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Sync Stats"}
            </button>
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {stats && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6">
                <Trophy className="w-8 h-8 mb-3" />
                <div className="text-3xl font-bold mb-1">{stats.totalSolved}</div>
                <div className="text-blue-100 text-sm">Total Solved</div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-sm text-gray-600 mb-1">Easy</div>
                <div className="text-2xl font-bold text-green-600">{stats.easySolved}</div>
                <div className="mt-2 bg-green-100 rounded-full h-2">
                  <div className="bg-green-600 h-full rounded-full" style={{ width: "75%" }} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-sm text-gray-600 mb-1">Medium</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.mediumSolved}</div>
                <div className="mt-2 bg-yellow-100 rounded-full h-2">
                  <div className="bg-yellow-600 h-full rounded-full" style={{ width: "60%" }} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-sm text-gray-600 mb-1">Hard</div>
                <div className="text-2xl font-bold text-red-600">{stats.hardSolved}</div>
                <div className="mt-2 bg-red-100 rounded-full h-2">
                  <div className="bg-red-600 h-full rounded-full" style={{ width: "35%" }} />
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Overall Progress</h3>
                  <span className="text-2xl font-bold text-blue-600">{solvedPercentage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${solvedPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {stats.totalSolved} of {totalProblems} problems solved
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Current Streak</div>
                    <div className="text-3xl font-bold text-orange-600">{stats.streak}</div>
                    <div className="text-sm text-gray-500">days</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Max Streak</div>
                    <div className="text-3xl font-bold text-orange-600">{stats.maxStreak}</div>
                    <div className="text-sm text-gray-500">days</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Global Rank</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {stats.ranking.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">position</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Weekly Progress</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="solved"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: "#2563eb", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Topic-wise Progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Topic-wise Progress</h3>
              <div className="space-y-4">
                {stats.topicWiseProgress.map((topic: any, index: number) => {
                  const percentage = Math.round((topic.solved / topic.total) * 100);
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                        <span className="text-sm text-gray-600">
                          {topic.solved}
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {stats.recentSubmissions.map((day: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{day.date}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {day.accepted} submissions
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* External Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-900">Practice More Problems</div>
                <div className="text-sm text-blue-700">Visit LeetCode to solve more challenges</div>
              </div>
              <a
                href="https://leetcode.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Go to LeetCode
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

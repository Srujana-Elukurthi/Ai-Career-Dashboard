import { useState, useCallback } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  Award,
  ArrowRight,
  FileText,
  Code,
  MessageCircle,
  Flame,
  Trophy,
  FlaskConical,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface DashboardProps {
  profileData: any;
  onNavigate: (page: string) => void;
  onBack: () => void;
}

export function Dashboard({
  profileData,
  onNavigate,
  onBack,
}: DashboardProps) {
  const API_BASE = "http://127.0.0.1:8000";

  const [mlForm, setMlForm] = useState({
    coding_score: parseFloat(profileData.programmingScore) || 70,
    aptitude_score: parseFloat(profileData.aptitudeScore) || 70,
    interview_score: parseFloat(profileData.communicationScore) || 65,
    resume_score: 70,
    projects_count: 2,
    skills_count: 5,
  });
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState("");
  const [mlResult, setMlResult] = useState<{
    prediction: string;
    confidence: number;
  } | null>(null);

  // Calculate readiness score based on test scores
  const calculateReadinessScore = () => {
    const scores = [
      parseFloat(profileData.dsaScore) || 0,
      parseFloat(profileData.programmingScore) || 0,
      parseFloat(profileData.sqlScore) || 0,
      parseFloat(profileData.communicationScore) || 0,
      parseFloat(profileData.aptitudeScore) || 0,
    ].filter((s) => s > 0);

    if (scores.length === 0) return 65;
    return Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );
  };

  const readinessScore = calculateReadinessScore();

  // Determine strengths and weaknesses
  const skillsData = [
    {
      name: "DSA",
      score: parseFloat(profileData.dsaScore) || 65,
    },
    {
      name: "Programming",
      score: parseFloat(profileData.programmingScore) || 72,
    },
    {
      name: "SQL",
      score: parseFloat(profileData.sqlScore) || 58,
    },
    {
      name: "Communication",
      score: parseFloat(profileData.communicationScore) || 80,
    },
    {
      name: "Aptitude",
      score: parseFloat(profileData.aptitudeScore) || 70,
    },
  ];

  const strengths = skillsData
    .filter((s) => s.score >= 70)
    .slice(0, 3);
  const weaknesses = skillsData
    .filter((s) => s.score < 70)
    .slice(0, 3);

  // Recommended role based on scores and career goal
  const recommendedRole =
    profileData.careerGoal ||
    "Software Development Engineer (SDE)";

  // Chart data for readiness score
  const chartData = [
    { name: "Completed", value: readinessScore },
    { name: "Remaining", value: 100 - readinessScore },
  ];

  const COLORS = ["#2563eb", "#e5e7eb"];

  const handleMlInputChange = (
    field: keyof typeof mlForm,
    value: string,
  ) => {
    const parsed = Number(value);
    setMlForm((prev) => ({ ...prev, [field]: Number.isNaN(parsed) ? 0 : parsed }));
  };

  const handlePredictReadiness = useCallback(async () => {
    if (mlLoading) return;
    setMlLoading(true);
    setMlError("");
    setMlResult(null);

    try {
      const res = await fetch(`${API_BASE}/predict-readiness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mlForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Prediction failed");
      }
      setTimeout(() => {
        setMlResult({
          prediction: data.prediction,
          confidence: data.confidence,
        });
        setMlLoading(false);
      }, 300);
    } catch (err: any) {
      setTimeout(() => {
        setMlError(err?.message || "Unable to connect to backend");
        setMlLoading(false);
      }, 300);
    }
  }, [mlForm, mlLoading]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-xl">
              PLACEXA
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("profile")}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profileData.name}!
          </h1>
          <p className="text-gray-600">
            {profileData.college} • {profileData.branch} • Year{" "}
            {profileData.year}
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => onNavigate("dashboard")}
            className="bg-blue-600 text-white rounded-xl p-4 text-left hover:bg-blue-700 transition-colors"
          >
            <Target className="w-6 h-6 mb-2" />
            <div className="font-semibold">Dashboard</div>
            <div className="text-sm opacity-90">
              Overview & Score
            </div>
          </button>

          <button
            onClick={() => onNavigate("skillgap")}
            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md transition-shadow"
          >
            <TrendingUp className="w-6 h-6 mb-2 text-blue-600" />
            <div className="font-semibold">
              Skill Gap Analysis
            </div>
            <div className="text-sm text-gray-600">
              Detailed Assessment
            </div>
          </button>

          <button
            onClick={() => onNavigate("roadmap")}
            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md transition-shadow"
          >
            <BookOpen className="w-6 h-6 mb-2 text-blue-600" />
            <div className="font-semibold">
              Placement Roadmap
            </div>
            <div className="text-sm text-gray-600">
              Week-wise Plan
            </div>
          </button>
        </div>

        {/* Readiness Score Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Main Score Card */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute">
                  <div className="text-4xl font-bold text-blue-600">
                    {readinessScore}%
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1">
                Placement Readiness
              </h3>
              <p className="text-sm text-gray-600">
                {readinessScore >= 80
                  ? "Excellent!"
                  : readinessScore >= 60
                    ? "Good progress"
                    : "Needs improvement"}
              </p>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold">
                  Your Strengths
                </h3>
              </div>
              <div className="space-y-3">
                {strengths.length > 0 ? (
                  strengths.map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700">
                        {skill.name}
                      </span>
                      <span className="text-green-600 font-medium">
                        {skill.score}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Complete tests to see your strengths
                  </p>
                )}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold">
                  Areas to Improve
                </h3>
              </div>
              <div className="space-y-3">
                {weaknesses.length > 0 ? (
                  weaknesses.map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700">
                        {skill.name}
                      </span>
                      <span className="text-orange-600 font-medium">
                        {skill.score}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    All skills are strong!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Role & Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Recommended Career Role */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6" />
              <h3 className="font-semibold text-lg">
                Recommended Career Role
              </h3>
            </div>
            <p className="text-2xl font-semibold mb-2">
              {recommendedRole}
            </p>
            <p className="text-blue-100 text-sm mb-4">
              Based on your profile and skill assessment, this
              role is an excellent match for you.
            </p>
            <button
              onClick={() => onNavigate("roadmap")}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
            >
              View Roadmap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate("skillgap")}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors flex items-center justify-between"
              >
                <span>View Detailed Skill Analysis</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => onNavigate("roadmap")}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors flex items-center justify-between"
              >
                <span>Access Preparation Roadmap</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => onNavigate("profile")}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors flex items-center justify-between"
              >
                <span>Update Profile & Scores</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* ML Readiness Predictor */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg">ML Readiness Predictor</h3>
          </div>
          <p className="text-sm text-gray-600 mb-5">
            Enter your current scores to predict whether you are placement-ready.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {[
              ["coding_score", "Coding Score", 0, 100],
              ["aptitude_score", "Aptitude Score", 0, 100],
              ["interview_score", "Interview Score", 0, 100],
              ["resume_score", "Resume Score", 0, 100],
              ["projects_count", "Projects Count", 0, 20],
              ["skills_count", "Skills Count", 0, 50],
            ].map(([field, label, min, max]) => (
              <label key={field} className="block">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <input
                  type="number"
                  min={Number(min)}
                  max={Number(max)}
                  value={mlForm[field as keyof typeof mlForm]}
                  onChange={(e) =>
                    handleMlInputChange(field as keyof typeof mlForm, e.target.value)
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>

          <button
            onClick={handlePredictReadiness}
            disabled={mlLoading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
          >
            {mlLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Predicting...
              </>
            ) : (
              "Predict Readiness"
            )}
          </button>

          {mlError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {mlError}
            </div>
          )}

          {mlResult && (
            <div
              className={`mt-4 rounded-lg p-4 border ${mlResult.prediction === "Ready"
                  ? "bg-green-50 border-green-200"
                  : "bg-orange-50 border-orange-200"
                }`}
            >
              <p className="text-sm text-gray-700 mb-1">Prediction Result</p>
              <p className="text-lg font-semibold text-gray-900">
                {mlResult.prediction}
              </p>
              <p className="text-sm text-gray-600">
                Confidence: {(mlResult.confidence * 100).toFixed(0)}%
              </p>
            </div>
          )}
        </div>

        {/* Advanced Features Grid */}
        <div>
          <h2 className="font-semibold text-lg mb-4">
            Advanced Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigate("resume")}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">
                Resume Analyzer
              </h3>
              <p className="text-sm text-gray-600">
                Get AI-powered resume feedback
              </p>
            </button>

            <button
              onClick={() => onNavigate("coding")}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">
                Coding Score Tracker
              </h3>
              <p className="text-sm text-gray-600">
                Track LeetCode progress
              </p>
            </button>

            <button
              onClick={() => onNavigate("interview")}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">
                Mock Interview AI
              </h3>
              <p className="text-sm text-gray-600">
                Practice with AI chatbot
              </p>
            </button>

            <button
              onClick={() => onNavigate("progress")}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-1">
                Progress Tracker
              </h3>
              <p className="text-sm text-gray-600">
                Track your daily streak
              </p>
            </button>

            <button
              onClick={() => onNavigate("codelab")}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg transition-all group md:col-span-2 lg:col-span-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FlaskConical className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">Code Lab</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">NEW</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Interactive coding environment with Monaco editor, step-by-step visualizer, AI explanations, complexity analysis &amp; fix suggestions
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </div>
            </button>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mt-8 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  Achievement Badges
                </h3>
                <p className="text-gray-600 text-sm">
                  You've earned 4 badges! Keep going to unlock
                  more rewards.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("badges")}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              View Badges
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
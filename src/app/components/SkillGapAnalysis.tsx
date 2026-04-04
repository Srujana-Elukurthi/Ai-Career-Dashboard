import { Brain, ArrowLeft, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SkillGapAnalysisProps {
  profileData: any;
  onNavigate: (page: string) => void;
}

export function SkillGapAnalysis({ profileData, onNavigate }: SkillGapAnalysisProps) {
  // Prepare chart data
  const skillsData = [
    { 
      name: "DSA", 
      score: parseFloat(profileData.dsaScore) || 65,
      target: 85,
      shortName: "DSA"
    },
    { 
      name: "Programming", 
      score: parseFloat(profileData.programmingScore) || 72,
      target: 85,
      shortName: "Prog"
    },
    { 
      name: "SQL", 
      score: parseFloat(profileData.sqlScore) || 58,
      target: 75,
      shortName: "SQL"
    },
    { 
      name: "Communication", 
      score: parseFloat(profileData.communicationScore) || 80,
      target: 85,
      shortName: "Comm"
    },
    { 
      name: "Aptitude", 
      score: parseFloat(profileData.aptitudeScore) || 70,
      target: 80,
      shortName: "Apt"
    }
  ];

  // Recommendations based on skill gaps
  const recommendations = skillsData.map(skill => {
    const gap = skill.target - skill.score;
    let priority = "Low";
    let color = "green";
    
    if (gap >= 20) {
      priority = "High";
      color = "red";
    } else if (gap >= 10) {
      priority = "Medium";
      color = "orange";
    }

    return {
      skill: skill.name,
      gap,
      priority,
      color,
      recommendations: getRecommendations(skill.name, gap)
    };
  }).sort((a, b) => b.gap - a.gap);

  function getRecommendations(skill: string, gap: number) {
    const recs: { [key: string]: string[] } = {
      "DSA": [
        "Practice 2-3 LeetCode problems daily",
        "Focus on Arrays, Strings, and LinkedLists first",
        "Join coding contest on weekends",
        "Review time & space complexity concepts"
      ],
      "Programming": [
        "Build 2-3 small projects",
        "Learn design patterns",
        "Practice debugging skills",
        "Contribute to open source"
      ],
      "SQL": [
        "Practice complex queries on HackerRank",
        "Learn JOIN operations thoroughly",
        "Understand indexing and optimization",
        "Work on database design projects"
      ],
      "Communication": [
        "Practice mock interviews weekly",
        "Record and review your presentations",
        "Join Toastmasters or similar groups",
        "Read and summarize technical articles"
      ],
      "Aptitude": [
        "Solve aptitude tests daily",
        "Focus on speed and accuracy",
        "Learn shortcut techniques",
        "Take timed mock tests"
      ]
    };

    return recs[skill] || ["Practice regularly", "Seek mentorship", "Take online courses"];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-xl">PLACEXA</span>
          </div>
          <button
            onClick={() => onNavigate("dashboard")}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Skill Gap Analysis</h1>
          <p className="text-gray-600">Detailed assessment of your skills vs industry requirements</p>
        </div>

        {/* Skills Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold text-lg mb-6">Current Score vs Target Score</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="shortName" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[4, 4, 0, 0]} />
              <Bar dataKey="score" name="Your Score" radius={[4, 4, 0, 0]}>
                {skillsData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.score >= entry.target ? "#10b981" : entry.score >= entry.target - 10 ? "#f59e0b" : "#ef4444"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Gap Analysis */}
        <div className="mb-8">
          <h2 className="font-semibold text-lg mb-4">Priority Focus Areas</h2>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={rec.skill} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      rec.priority === "High" ? "bg-red-100" : 
                      rec.priority === "Medium" ? "bg-orange-100" : "bg-green-100"
                    }`}>
                      {rec.gap <= 5 ? (
                        <CheckCircle2 className={`w-5 h-5 text-green-600`} />
                      ) : (
                        <AlertCircle className={`w-5 h-5 ${
                          rec.priority === "High" ? "text-red-600" : 
                          rec.priority === "Medium" ? "text-orange-600" : "text-green-600"
                        }`} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{rec.skill}</h3>
                      <p className="text-sm text-gray-600">
                        Gap: {rec.gap} points • Priority: <span className={`font-medium ${
                          rec.priority === "High" ? "text-red-600" : 
                          rec.priority === "Medium" ? "text-orange-600" : "text-green-600"
                        }`}>{rec.priority}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ml-13 space-y-2">
                  <p className="font-medium text-sm text-gray-700 mb-2">Recommended Actions:</p>
                  <ul className="space-y-2">
                    {rec.recommendations.map((recommendation, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Insights */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">AI Insights</h3>
              <p className="text-gray-700 mb-3">
                Based on your skill analysis, focusing on the high-priority areas will significantly improve 
                your placement readiness. Dedicate 60% of your preparation time to high-priority skills.
              </p>
              <button
                onClick={() => onNavigate("roadmap")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                View Personalized Roadmap
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

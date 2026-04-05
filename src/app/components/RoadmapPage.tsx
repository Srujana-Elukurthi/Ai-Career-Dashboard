import { Brain, ArrowLeft, Calendar, CheckCircle2, Circle, BookOpen, Code, Database, Users, Award, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { API_BASE_URL } from "../config";

interface RoadmapPageProps {
  profileData: any;
  onNavigate: (page: string) => void;
}

interface RoadmapWeek {
  week: number;
  title: string;
  focus: string;
  topics: string[];
  practice: string;
  status: "completed" | "current" | "upcoming";
}

export function RoadmapPage({ profileData, onNavigate }: RoadmapPageProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>("general");
  const [allRoadmaps, setAllRoadmaps] = useState<Record<string, RoadmapWeek[]>>({});
  const [completedWeeks, setCompletedWeeks] = useState<Record<number, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({
    general: true,
    amazon: true,
    tcs: true,
    deloitte: true
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Fetch User Data & Progress on mount
  useEffect(() => {
    const fetchUserAndProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        setUserId(user.id);

        const { data: progressData, error: progressError } = await supabase
          .from("user_progress")
          .select("week_number")
          .eq("user_id", user.id);

        if (progressError) throw progressError;

        const progressMap: Record<number, boolean> = {};
        progressData?.forEach((item: any) => {
          progressMap[item.week_number] = true;
        });
        setCompletedWeeks(progressMap);
      } catch (err: any) {
        console.error("Progress Fetch Error:", err);
      }
    };
    fetchUserAndProgress();
  }, []);

  // 2. Pre-fetch ALL roadmaps in parallel
  useEffect(() => {
    // We fetch even if userId is null to support Guest Mode (no backend persistence)
    const companies = ["general", "amazon", "tcs", "deloitte"];
    
    const fetchAllRoadmaps = async () => {
      setError(null);
      
      const fetchPromises = companies.map(async (company) => {
        try {
          const res = await fetch(`${API_BASE_URL}/generate-roadmap`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: userId,
              careerGoal: profileData.careerGoal || "Software Engineer",
              dsaScore: parseFloat(profileData.dsaScore) || 0,
              programmingScore: parseFloat(profileData.programmingScore) || 0,
              sqlScore: parseFloat(profileData.sqlScore) || 0,
              communicationScore: parseFloat(profileData.communicationScore) || 0,
              aptitudeScore: parseFloat(profileData.aptitudeScore) || 0,
              targetCompany: company
            }),
          });

          if (!res.ok) throw new Error(`Server returned ${res.status} for ${company}`);
          const data = await res.json();
          
          setAllRoadmaps(prev => ({ ...prev, [company]: data.weeks }));
        } catch (err: any) {
          console.error(`Error fetching ${company} roadmap:`, err);
          setError(`Unable to connect to preparation engine for ${company}. Check if backend is running.`);
        } finally {
          setLoadingMap(prev => ({ ...prev, [company]: false }));
        }
      });

      await Promise.all(fetchPromises);
    };

    fetchAllRoadmaps();
  }, [userId, profileData]);

  const activeRoadmap = allRoadmaps[selectedCompany] || [];
  const isLoadingActive = loadingMap[selectedCompany];

  const toggleWeekCompletion = async (weekNumber: number) => {
    setIsSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isCurrentlyCompleted = !!completedWeeks[weekNumber];

      if (isCurrentlyCompleted) {
        // Mark as Incomplete (Delete)
        const { error: deleteError } = await supabase
          .from("user_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("week_number", weekNumber);
        
        if (deleteError) throw deleteError;
        
        setCompletedWeeks(prev => {
          const next = { ...prev };
          delete next[weekNumber];
          return next;
        });
      } else {
        // Mark as Completed (Insert)
        const { error: insertError } = await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            week_number: weekNumber,
            completed: true
          });
        
        if (insertError) throw insertError;
        
        setCompletedWeeks(prev => ({
          ...prev,
          [weekNumber]: true
        }));
      }
    } catch (err) {
      console.error("Progress sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper for status determination
  const getDisplayStatus = (weekNum: number) => {
    return completedWeeks[weekNum] ? "completed" : "upcoming";
  };

  const completedCount = Object.keys(completedWeeks).length;
  const progressPercent = (completedCount / 8) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "current":
        return <Circle className="w-5 h-5 text-blue-600 fill-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50";
      case "current":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

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

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Personalized Placement Roadmap</h1>
          <p className="text-gray-600">8-week preparation plan tailored for {profileData.careerGoal || "Software Development"}</p>
        </div>

        {/* Company Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Target Company</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            <button
              onClick={() => setSelectedCompany("general")}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                selectedCompany === "general"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              General Prep
            </button>
            <button
              onClick={() => setSelectedCompany("amazon")}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                selectedCompany === "amazon"
                  ? "border-orange-600 bg-orange-50 text-orange-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              Amazon
            </button>
            <button
              onClick={() => setSelectedCompany("tcs")}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                selectedCompany === "tcs"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              TCS
            </button>
            <button
              onClick={() => setSelectedCompany("deloitte")}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                selectedCompany === "deloitte"
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              Deloitte
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Overall Progress</h2>
            <span className="text-sm font-medium text-blue-600">{completedCount} of 8 weeks finished</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-600">
              {progressPercent === 0 ? "Ready to start!" : progressPercent === 100 ? "Amazing! You are ready 🏆" : `${Math.round(progressPercent)}% Complete`}
            </span>
            <span className="text-sm font-medium text-blue-600">8 week journey</span>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="space-y-6 relative min-h-[400px]">
          {isLoadingActive && (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-6 h-40">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-blue-700 font-medium animate-pulse">Loading {selectedCompany} roadmap...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-8 bg-red-50 border-2 border-red-100 rounded-xl text-center">
              <p className="text-red-600 font-medium">Unable to generate roadmap</p>
              <p className="text-sm text-red-500 mt-1">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Retry Generation
              </button>
            </div>
          )}

          {!isLoadingActive && !error && activeRoadmap.length > 0 && activeRoadmap.map((week, index) => {
            const currentStatus = getDisplayStatus(week.week);
            const isWeekCompleted = !!completedWeeks[week.week];

            return (
              <div key={week.week} className="relative">
                {/* Connecting Line */}
                {index < activeRoadmap.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200 -z-10"></div>
                )}

                <div className={`rounded-xl border-2 p-6 transition-all ${getStatusColor(currentStatus)}`}>
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(currentStatus)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Week {week.week}</span>
                            {isWeekCompleted && (
                              <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">Completed</span>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold mb-1">{week.title}</h3>
                          <p className="text-gray-600">{week.focus}</p>
                        </div>

                        {/* Completion Toggle */}
                        <button
                          onClick={() => toggleWeekCompletion(week.week)}
                          disabled={isSyncing}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                            isWeekCompleted
                              ? "border-green-200 bg-white text-green-700 hover:bg-green-50"
                              : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          } ${isSyncing ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isWeekCompleted ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Mark as Incomplete
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Mark as Completed
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mt-4">
                        {/* Topics */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <h4 className="font-medium">Key Topics</h4>
                          </div>
                          <ul className="space-y-2">
                            {week.topics.map((topic: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Practice */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Code className="w-4 h-4 text-blue-600" />
                            <h4 className="font-medium">Practice Goal</h4>
                          </div>
                          <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                            {week.practice}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!isLoadingActive && !error && activeRoadmap.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Select a company to see your preparation path
            </div>
          )}
        </div>

        {/* Additional Resources */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Database className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Practice Platforms</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• LeetCode</li>
              <li>• HackerRank</li>
              <li>• Codeforces</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Mock Interviews</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Pramp</li>
              <li>• Interviewing.io</li>
              <li>• Peer practice</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Award className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Learning Resources</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• YouTube tutorials</li>
              <li>• GeeksforGeeks</li>
              <li>• System Design Primer</li>
            </ul>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-3">Pro Tips for Success</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Consistency is key - dedicate 2-3 hours daily for preparation</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Focus on understanding concepts rather than memorizing solutions</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Track your progress and adjust the plan based on your learning pace</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Don't skip mock interviews - they're crucial for real interview performance</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
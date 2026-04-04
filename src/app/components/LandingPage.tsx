import { useState, useEffect } from "react";
import { ArrowRight, Brain, Target, TrendingUp, Users, LogOut, UserCircle } from "lucide-react";
import { AuthModal } from "./AuthModal";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (loggedIn) {
      setIsLoggedIn(true);
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setUsername(u.username || "");
        } catch (e) { }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setUsername("");
  };

  const handleAuthSuccess = (user: any) => {
    setIsLoggedIn(true);
    setUsername(user.username);
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-xl">PLACEXA</span>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 text-gray-700">
                  <UserCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Hello, {username}!</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => { setAuthMode("signup"); setShowAuthModal(true); }}
                  className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors shadow-sm"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="text-center pt-20 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm mb-6">
            <Brain className="w-4 h-4" />
            <span>AI-Powered Career Intelligence</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            PLACEXA
          </h1>

          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            An AI-Powered Career Intelligence and Placement Readiness Agent
          </p>

          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Transform your placement preparation journey with personalized insights, skill gap analysis,
            and AI-driven roadmaps designed specifically for college students.
          </p>

          <button
            onClick={() => {
              if (isLoggedIn) {
                onGetStarted();
              } else {
                setAuthMode("signup");
                setShowAuthModal(true);
              }
            }}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-16">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Readiness Score</h3>
            <p className="text-gray-600 text-sm">
              Get an instant placement readiness assessment based on your skills and performance.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Skill Gap Analysis</h3>
            <p className="text-gray-600 text-sm">
              Identify your strengths and weaknesses with AI-powered skill assessment.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Smart Roadmap</h3>
            <p className="text-gray-600 text-sm">
              Receive a personalized week-by-week preparation plan tailored to your goals.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Career Guidance</h3>
            <p className="text-gray-600 text-sm">
              Discover the best career roles that match your profile and interests.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-12 my-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">85%</div>
              <div className="text-gray-600">Average Readiness Improvement</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10k+</div>
              <div className="text-gray-600">Students Prepared</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Partner Companies</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600 text-sm">
          © 2026 PLACEXA. AI-Powered Career Intelligence Platform.
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

import { Brain, ArrowRight, ExternalLink } from "lucide-react";
import { useState } from "react";

interface ProfileData {
  name: string;
  college: string;
  branch: string;
  year: string;
  skills: string[];
  dsaScore: string;
  programmingScore: string;
  sqlScore: string;
  communicationScore: string;
  aptitudeScore: string;
  careerGoal: string;
}

interface ProfilePageProps {
  onSubmit: (data: ProfileData) => void;
  onBack: () => void;
}

const skillOptions = [
  "Data Structures & Algorithms",
  "Programming (Java/Python/C++)",
  "SQL & Databases",
  "Communication Skills",
  "Aptitude & Reasoning"
];

const careerGoals = [
  "Software Development Engineer (SDE)",
  "Data Analyst",
  "QA/Test Engineer",
  "DevOps Engineer",
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Developer",
  "Data Scientist"
];

const practicePlatforms = [
  {
    category: "Aptitude",
    platforms: [
      { name: "IndiaBix", url: "https://www.indiabix.com" },
      { name: "PrepInsta", url: "https://prepinsta.com" },
      { name: "FreshersWorld", url: "https://www.freshersworld.com" },
      { name: "Testbook", url: "https://testbook.com" }
    ]
  },
  {
    category: "Coding",
    platforms: [
      { name: "LeetCode", url: "https://leetcode.com" },
      { name: "HackerRank", url: "https://www.hackerrank.com" },
      { name: "CodeChef", url: "https://www.codechef.com" },
      { name: "Codeforces", url: "https://codeforces.com" },
      { name: "GeeksforGeeks Practice", url: "https://practice.geeksforgeeks.org" }
    ]
  },
  {
    category: "Communication / Verbal",
    platforms: [
      { name: "British Council", url: "https://learnenglish.britishcouncil.org" },
      { name: "Grammarly", url: "https://www.grammarly.com" },
      { name: "Vocabulary.com", url: "https://www.vocabulary.com" },
      { name: "Cambridge English", url: "https://www.cambridgeenglish.org" }
    ]
  },
  {
    category: "Technical (Core Subjects)",
    platforms: [
      { name: "GeeksforGeeks", url: "https://www.geeksforgeeks.org" },
      { name: "TutorialsPoint", url: "https://www.tutorialspoint.com" },
      { name: "Sanfoundry", url: "https://www.sanfoundry.com" },
      { name: "Javatpoint", url: "https://www.javatpoint.com" }
    ]
  },
  {
    category: "Mock Interview / HR",
    platforms: [
      { name: "Pramp", url: "https://www.pramp.com" },
      { name: "InterviewBuddy", url: "https://www.interviewbuddy.in" },
      { name: "Gainlo", url: "https://www.gainlo.co" },
      { name: "AmbitionBox Interview Questions", url: "https://www.ambitionbox.com/interviews" }
    ]
  }
];

export function ProfilePage({ onSubmit, onBack }: ProfilePageProps) {
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    college: "",
    branch: "CSE",
    year: "",
    skills: [],
    dsaScore: "",
    programmingScore: "",
    sqlScore: "",
    communicationScore: "",
    aptitudeScore: "",
    careerGoal: ""
  });

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-xl">PLACEXA</span>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Back
          </button>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Profile</h1>
          <p className="text-gray-600">Help us understand your background to provide personalized insights</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT (70%) */}
          <div className="w-full lg:w-[70%]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College/University
                </label>
                <input
                  type="text"
                  required
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your college name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <select
                    required
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50"
                  >
                    <option value="CSE">Computer Science Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year of Study
                  </label>
                  <select
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-4">Skills & Competencies</h2>
            <p className="text-sm text-gray-600 mb-4">Select the skills you want to focus on</p>
            
            <div className="space-y-2">
              {skillOptions.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mock Test Scores */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-4">Mock Test Scores</h2>
            <p className="text-sm text-gray-600 mb-4">Enter your recent test scores (0-100)</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DSA Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.dsaScore}
                  onChange={(e) => setFormData({ ...formData, dsaScore: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programming Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.programmingScore}
                  onChange={(e) => setFormData({ ...formData, programmingScore: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SQL Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.sqlScore}
                  onChange={(e) => setFormData({ ...formData, sqlScore: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Communication Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.communicationScore}
                  onChange={(e) => setFormData({ ...formData, communicationScore: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aptitude Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.aptitudeScore}
                  onChange={(e) => setFormData({ ...formData, aptitudeScore: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0-100"
                />
              </div>
            </div>
          </div>

          {/* Career Goal */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-4">Career Goal</h2>
            <p className="text-sm text-gray-600 mb-4">What role are you targeting?</p>
            
            <select
              required
              value={formData.careerGoal}
              onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select your career goal</option>
              {careerGoals.map((goal) => (
                <option key={goal} value={goal}>{goal}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
          >
            Generate Analysis
            <ArrowRight className="w-5 h-5" />
          </button>
            </form>
          </div>

          {/* RIGHT (30%) */}
          <div className="w-full lg:w-[30%] sticky top-6 h-fit bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-y-auto max-h-[calc(100vh-3rem)]">
            <h2 className="font-semibold text-lg mb-2">Practice / Take Mock Tests</h2>
            <p className="text-sm text-gray-600 mb-6">Practice on these platforms before entering your scores</p>
            
            <div className="flex flex-col gap-6">
              {practicePlatforms.map((category, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="font-medium text-gray-800 border-b pb-2">{category.category}</h3>
                  <div className="flex flex-col gap-2">
                    {category.platforms.map((platform, pIdx) => (
                      <a
                        key={pIdx}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors"
                      >
                        {platform.name}
                        <ExternalLink className="w-4 h-4 opacity-50" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

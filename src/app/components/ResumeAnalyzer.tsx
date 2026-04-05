import { useState, useCallback, type ChangeEvent } from "react";
import { API_BASE_URL } from "../config";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft, Target } from "lucide-react";

interface ResumeAnalyzerProps {
  onNavigate: (page: string) => void;
  profileData: any;
}

interface ResumeAnalysis {
  score: number;
  skills_found: string[];
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}

export function ResumeAnalyzer({ onNavigate, profileData }: ResumeAnalyzerProps) {
  const API_BASE = API_BASE_URL;
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const selectedFile = e.target.files[0];
    const lower = selectedFile.name.toLowerCase();
    if (!(lower.endsWith(".pdf") || lower.endsWith(".docx"))) {
      setError("Please upload only PDF or DOCX files.");
      setFile(null);
      setAnalysis(null);
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB.");
      setFile(null);
      setAnalysis(null);
      return;
    }

    setError("");
    setFile(selectedFile);
    setAnalysis(null);
  };

  const analyzeResume = useCallback(async () => {
    if (analyzing || !file) return;
    setAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/analyze-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Resume analysis failed.");
      }

      setAnalysis(data.analysis as ResumeAnalysis);
      setAnalyzing(false);
    } catch (err: any) {
      setError(err?.message || "Unable to analyze resume right now.");
      setAnalyzing(false);
    }
  }, [file, analyzing]);

  return (
    <div className="min-h-screen bg-gray-50">
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
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-xl">Resume Analyzer</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold mb-2">Upload Your Resume</h2>
          <p className="text-gray-600 mb-6">
            Get AI-powered feedback for a Software Engineer role
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-1">
                {file ? file.name : "Click to upload resume"}
              </p>
              <p className="text-sm text-gray-500">PDF or DOCX (Max 5MB)</p>
            </label>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {file && !analyzing && !analysis && (
            <button
              onClick={analyzeResume}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Analyze Resume
            </button>
          )}

          {analyzing && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Analyzing your resume...</p>
            </div>
          )}
        </div>

        {analysis && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Overall Resume Score</h3>
                  <p className="text-blue-100 text-sm">Based on Software Engineer role fit</p>
                </div>
                <div className="text-5xl font-bold">{analysis.score}%</div>
              </div>
              <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Summary</h3>
                  <p className="text-sm text-gray-600">Quick overview of your resume quality</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {analysis.summary || "No summary returned by the analyzer."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold">Weaknesses</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Skills Found</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.skills_found.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold">Missing Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold">Suggestions</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-yellow-600">•</span>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

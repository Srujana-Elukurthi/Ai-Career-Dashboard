import { useState } from "react";
import { LandingPage } from "@/app/components/LandingPage";
import { ProfilePage } from "@/app/components/ProfilePage";
import { Dashboard } from "@/app/components/Dashboard";
import { SkillGapAnalysis } from "@/app/components/SkillGapAnalysis";
import { RoadmapPage } from "@/app/components/RoadmapPage";
import { ResumeAnalyzer } from "@/app/components/ResumeAnalyzer";
import { CodingScoreTracker } from "@/app/components/CodingScoreTracker";
import { MockInterviewChat } from "@/app/components/MockInterviewChat";
import { ProgressTracker } from "@/app/components/ProgressTracker";
import { BadgeSystem } from "@/app/components/BadgeSystem";
import { CodeLab } from "@/app/components/CodeLab";

type Page = "landing" | "profile" | "dashboard" | "skillgap" | "roadmap" | "resume" | "coding" | "interview" | "progress" | "badges" | "codelab";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [profileData, setProfileData] = useState<any>(null);

  const handleGetStarted = () => {
    setCurrentPage("profile");
  };

  const handleProfileSubmit = (data: any) => {
    setProfileData(data);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleBackToLanding = () => {
    setCurrentPage("landing");
    setProfileData(null);
  };

  return (
    <div className="min-h-screen">
      {currentPage === "landing" && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      
      {currentPage === "profile" && (
        <ProfilePage 
          onSubmit={handleProfileSubmit} 
          onBack={handleBackToLanding}
        />
      )}
      
      {currentPage === "dashboard" && profileData && (
        <Dashboard 
          profileData={profileData}
          onNavigate={handleNavigate}
          onBack={handleBackToLanding}
        />
      )}
      
      {currentPage === "skillgap" && profileData && (
        <SkillGapAnalysis 
          profileData={profileData}
          onNavigate={handleNavigate}
        />
      )}
      
      {currentPage === "roadmap" && profileData && (
        <RoadmapPage 
          profileData={profileData}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === "resume" && profileData && (
        <ResumeAnalyzer 
          profileData={profileData}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === "coding" && profileData && (
        <CodingScoreTracker 
          profileData={profileData}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === "interview" && profileData && (
        <MockInterviewChat 
          profileData={profileData}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === "progress" && profileData && (
        <ProgressTracker 
          profileData={profileData}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === "badges" && profileData && (
        <BadgeSystem 
          profileData={profileData}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === "codelab" && profileData && (
        <CodeLab 
          profileData={profileData}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
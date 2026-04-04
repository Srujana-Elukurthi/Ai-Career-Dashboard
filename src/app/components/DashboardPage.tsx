import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle2, Award } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import type { StudentProfile } from '@/app/App';

interface DashboardPageProps {
  profile: StudentProfile | null;
}

export function DashboardPage({ profile }: DashboardPageProps) {
  const navigate = useNavigate();

  if (!profile) {
    navigate('/profile');
    return null;
  }

  // Calculate readiness score
  const skillValues = Object.values(profile.skills);
  const readinessScore = Math.round(skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length);

  // Identify strengths and weaknesses
  const skillEntries = Object.entries(profile.skills);
  const strengths = skillEntries
    .filter(([_, value]) => value >= 70)
    .map(([key, value]) => ({ name: formatSkillName(key), value }))
    .sort((a, b) => b.value - a.value);
  
  const weaknesses = skillEntries
    .filter(([_, value]) => value < 60)
    .map(([key, value]) => ({ name: formatSkillName(key), value }))
    .sort((a, b) => a.value - b.value);

  function formatSkillName(key: string): string {
    const names: Record<string, string> = {
      dsa: 'Data Structures & Algorithms',
      programming: 'Programming Skills',
      sql: 'SQL & Database',
      communication: 'Communication',
      aptitude: 'Aptitude & Reasoning'
    };
    return names[key] || key;
  }

  const getRecommendedRole = () => {
    const { dsa, programming, sql } = profile.skills;
    if (dsa >= 70 && programming >= 70) return 'Software Development Engineer';
    if (sql >= 70 && programming >= 60) return 'Data Analyst';
    if (programming >= 60) return 'Full Stack Developer';
    return 'Associate Software Engineer';
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const readinessLevel = getReadinessLevel(readinessScore);
  const recommendedRole = getRecommendedRole();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/profile')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
        
        <h1 className="mb-2 text-blue-900">Placement Readiness Dashboard</h1>
        <p className="text-gray-600">Welcome back, {profile.name}!</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Readiness Score Card */}
        <Card className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
              <div className="text-white">
                <div className="text-4xl">{readinessScore}%</div>
              </div>
            </div>
            
            <h3 className="mb-2 text-gray-900">Overall Readiness</h3>
            <div className={`inline-block px-4 py-1 rounded-full ${readinessLevel.bg} ${readinessLevel.color}`}>
              {readinessLevel.level}
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              Based on your skills assessment
            </p>
          </div>
        </Card>

        {/* Recommended Role */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5" />
                <h3>Recommended Career Path</h3>
              </div>
              <p className="text-blue-100 text-sm mb-4">
                Based on your profile and skills analysis
              </p>
            </div>
            <Award className="h-8 w-8 text-blue-200" />
          </div>
          
          <div className="text-3xl mb-2">
            {recommendedRole}
          </div>
          
          <p className="text-blue-100 mb-6">
            Your skills align well with this role. Focus on the areas below to maximize your chances.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/skill-gap')}
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              View Skill Gaps
            </Button>
            <Button 
              onClick={() => navigate('/roadmap')}
              variant="secondary"
              className="bg-blue-500 text-white hover:bg-blue-400"
            >
              Get Roadmap
            </Button>
          </div>
        </Card>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        <Card className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h2 className="text-gray-900">Your Strengths</h2>
          </div>
          
          {strengths.length > 0 ? (
            <div className="space-y-4">
              {strengths.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">{skill.name}</span>
                    <span className="text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {skill.value}%
                    </span>
                  </div>
                  <Progress value={skill.value} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Complete your skill assessment to identify strengths
            </p>
          )}
        </Card>

        {/* Weaknesses */}
        <Card className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h2 className="text-gray-900">Areas for Improvement</h2>
          </div>
          
          {weaknesses.length > 0 ? (
            <div className="space-y-4">
              {weaknesses.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">{skill.name}</span>
                    <span className="text-orange-600 flex items-center gap-1">
                      <TrendingDown className="h-4 w-4" />
                      {skill.value}%
                    </span>
                  </div>
                  <Progress value={skill.value} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Great! All your skills are above the threshold
            </p>
          )}
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="mb-6 text-gray-900">Skill Breakdown</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {skillEntries.map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-3xl mb-2 text-blue-600">
                {value}%
              </div>
              <div className="text-sm text-gray-600">
                {formatSkillName(key)}
              </div>
              <Progress value={value} className="mt-2 h-1" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

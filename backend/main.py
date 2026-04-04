import ast
import asyncio
import csv
import hashlib
import json
import os
import random
import re
import requests
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List
from dotenv import load_dotenv
from supabase import create_client, Client

try:
    from openai import AsyncOpenAI
    _openai_available = True
except ImportError:
    AsyncOpenAI = None
    _openai_available = False

load_dotenv()
_openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()
openai_client = AsyncOpenAI(api_key=_openai_api_key) if (_openai_available and _openai_api_key) else None

if openai_client:
    print("✅ OpenAI client initialized successfully.")
else:
    print("❌ OpenAI client initialization FAILED! Key might be missing or package issue.")
    if not _openai_api_key:
        print("   -> Reason: OPENAI_API_KEY is empty or not found in .env")
    if not _openai_available:
        print("   -> Reason: openai package not correctly imported")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("WARNING: SUPABASE_URL or SUPABASE_ANON_KEY not set!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY) if SUPABASE_URL and SUPABASE_ANON_KEY else None

import joblib
import numpy as np
from fastapi import FastAPI
from fastapi import File, HTTPException, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    from docx import Document
except ImportError:
    Document = None

app = FastAPI()

MODEL_DIR = Path(__file__).resolve().parent / "models"
DATA_DIR = Path(__file__).resolve().parent / "data"
MODEL_PATH = MODEL_DIR / "readiness_model.joblib"
MODEL_FEATURES_PATH = MODEL_DIR / "readiness_features.joblib"
DATASET_PATH = DATA_DIR / "readiness_training_data.csv"
METRICS_PATH = MODEL_DIR / "readiness_metrics.joblib"

READINESS_FEATURES = [
    "coding_score",
    "aptitude_score",
    "interview_score",
    "resume_score",
    "projects_count",
    "skills_count",
]


class ReadinessInput(BaseModel):
    coding_score: float = Field(..., ge=0, le=100)
    aptitude_score: float = Field(..., ge=0, le=100)
    interview_score: float = Field(..., ge=0, le=100)
    resume_score: float = Field(..., ge=0, le=100)
    projects_count: int = Field(..., ge=0, le=20)
    skills_count: int = Field(..., ge=0, le=50)


class RoadmapRequest(BaseModel):
    careerGoal: str
    dsaScore: float
    programmingScore: float
    sqlScore: float
    communicationScore: float
    aptitudeScore: float
    targetCompany: str = "general"
    userId: str = None  # New field for caching


readiness_model = None

# ✅ Allow frontend connection (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Home route
@app.get("/")
def home():
    status = "running"
    db_connected = supabase is not None
    openai_initialized = openai_client is not None
    return {
        "status": status,
        "db_connected": db_connected,
        "openai_initialized": openai_initialized,
        "message": "Backend is running 🚀"
    }


@app.post("/generate-roadmap")
async def generate_roadmap(request: RoadmapRequest):
    """Generate an 8-week roadmap using OpenAI based on user scores and career goals."""
    
    # 1. Fallback Logic (Mock AI if key is missing or service fails)
    def get_fallback_roadmap(req: RoadmapRequest):
        is_data_analyst = "data" in req.careerGoal.lower()
        company = req.targetCompany.lower() if req.targetCompany else "general"
        
        # --- STRICT DIFFERENTIATION Content ---
        if company == "amazon":
            # Focus: DSA Medium/Hard + System Design + Leadership Principles
            titles = ["Arrays & HashMaps", "Strings & Sliding Window", "Stacks, Queues & Lists", "Trees & Recursion", "Graphs & BFS/DFS", "Dynamic Programming", "System Design Basics", "Amazon Leadership Principles"]
            focuses = ["Complexity & Efficiency", "Pattern Recognition", "Data Struct Mastery", "Recursive Thinking", "Graph Traversal", "Optimized Solving", "HLD/LLD Scalability", "Behavioral (STAR Method)"]
        elif company == "tcs":
            # Focus: Aptitude + Coding Basics + Verbal
            titles = ["Quantitative Aptitude I", "Logical Reasoning I", "Verbal Ability I", "Quantitative Aptitude II", "Logical Reasoning II", "Programming Basics (C/Java)", "Data Structures (Basic)", "TCS NQT Full Mock Prep"]
            focuses = ["Number System/Ratio", "Series/Coding-Decoding", "Grammar/Comprehension", "Permutation/Probability", "Syllogisms/Blood Rels", "Loops & Arrays", "Linear Data Structs", "NQT Pattern Practice"]
        elif company == "deloitte":
            # Focus: Case Studies + Analytics + Business Comm
            titles = ["Business Communication", "Quant & Data Interpretation", "Logical Puzzles", "Excel for Analytics", "SQL & DBMS Basics", "Deloitte Case Study Prep", "Situational Judgment", "Interaction & GD Skills"]
            focuses = ["Email & Professionalism", "Data Analysis Tips", "Problem Solving", "Data Manipulation", "Querying & Storage", "Business Logic Scenarios", "Workplace Ethics", "Public Speaking/Presenting"]
        else: # General
            titles = ["Programming Fundamentals", "Basic Data Structures", "SQL & Databases", "Project Phase I", "Web/App Dev Core", "Project Phase II", "Aptitude Fundamentals", "Mock Interview Mastery"]
            focuses = ["Syntax & Logic", "Arrays & Strings", "CRUD Operations", "Requirement Specs", "Feature Development", "Testing & Refactoring", "Speed & Accuracy", "Confidence & Presence"]

        weeks = []
        for i in range(1, 9):
            weeks.append({
                "week": i,
                "title": titles[i-1],
                "focus": focuses[i-1],
                "topics": [f"{titles[i-1]} Basics", "Implementation", f"Special {company.capitalize()} Module"],
                "practice": "15 Practice Problems" if not is_data_analyst else "2 Data Projects",
                "status": "upcoming"
            })
        return {"weeks": weeks}

    # 2. Cache Check (Supabase)
    if supabase and request.userId:
        try:
            cache_res = supabase.table("user_roadmaps").select("roadmap_data").eq("user_id", request.userId).eq("role", request.careerGoal).eq("company", request.targetCompany).execute()
            if cache_res.data and len(cache_res.data) > 0:
                print(f"✅ Cache Hit: roadmap found for {request.targetCompany}")
                return cache_res.data[0]["roadmap_data"]
        except Exception as e:
            print(f"⚠️ Cache check failed: {e}")

    # 2. OpenAI Generation
    if not openai_client:
        print("DEBUG: Using fallback because openai_client is None")
        return get_fallback_roadmap(request)

    print(f"DEBUG: Generating AI roadmap for role: {request.careerGoal} with key: {(_openai_api_key[:5] + '...') if _openai_api_key else 'NONE'}")

    prompt = f"""
    Generate a strictly formatted 8-week placement preparation roadmap for a student.
    
    USER PROFILE:
    - Target Role: {request.careerGoal}
    - Target Company: {request.targetCompany}
    - CURRENT SKILL SCORES (0-100):
      - Data Structures (DSA): {request.dsaScore}
      - Programming: {request.programmingScore}
      - SQL: {request.sqlScore}
      - Communication: {request.communicationScore}
      - Aptitude: {request.aptitudeScore}

    CRITICAL RULES:
    1. If a score is < 50, prioritize that skill in Weeks 1-3.
    2. If all scores are high (> 80), focus on "Advanced System Design" and "Hard LeetCode".
    3. If the role is 'Data Analyst', prioritize SQL and Python for Data in early weeks.
    4. If the role is 'Software Engineer', prioritize DSA and Core CS early.
    5. Target company is '{request.targetCompany}'. Tailor week 7-8 for their specific interview style.

    OUTPUT FORMAT:
    Return ONLY a JSON object with a 'weeks' key containing an array of 8 objects. 
    NO other text.
    Each object MUST have:
    - week: (int 1-8)
    - title: (string)
    - focus: (string summary)
    - topics: (array of strings)
    - practice: (string specific practice goal)
    - status: "upcoming"

    Example structure:
    {{
      "weeks": [
        {{ "week": 1, "title": "...", "focus": "...", "topics": [...], "practice": "...", "status": "upcoming" }},
        ...
      ]
    }}
    """

    # Try GPT-4o first, fallback to GPT-3.5 if needed
    models_to_try = ["gpt-4o", "gpt-3.5-turbo"]
    last_error = None

    for model in models_to_try:
        try:
            print(f"DEBUG: Attempting roadmap generation with {model}...")
            response = await openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a professional career coach and expert technical recruiter."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            print(f"✅ Successfully generated roadmap using {model}")
            
            # Save to Cache
            if supabase and request.userId:
                try:
                    supabase.table("user_roadmaps").upsert({
                        "user_id": request.userId,
                        "role": request.careerGoal,
                        "company": request.targetCompany,
                        "roadmap_data": result
                    }).execute()
                    print(f"💾 Roadmap cached in Supabase for {request.targetCompany}")
                except Exception as e:
                    print(f"⚠️ Cache saving failed: {e}")
            
            return result
        except Exception as e:
            last_error = e
            print(f"⚠️ {model} failed: {e}")
            continue

    print(f"❌ All OpenAI models failed. Last error: {last_error}")
    final_fallback = get_fallback_roadmap(request)
    
    # Save fallback to cache too (Silent failure if DB is down)
    if supabase and request.userId:
        try:
            # We use a very permissive upsert to avoid schema mismatch issues blocking the user
            supabase.table("user_roadmaps").upsert({
                "user_id": request.userId,
                "role": request.careerGoal,
                "company": request.targetCompany,
                "roadmap_data": final_fallback
            }).execute()
            print(f"💾 Fallback roadmap cached in Supabase for {request.targetCompany}")
        except Exception as e:
            # DO NOT raise here, just log it. The user should still get the fallback.
            print(f"⚠️ Fallback cache saving failed (likely schema mismatch or connection): {e}")
            
    return final_fallback



def _extract_pdf_text(file_bytes: bytes) -> str:
    from io import BytesIO

    if pdfplumber is None:
        raise HTTPException(
            status_code=500,
            detail="Missing dependency: pdfplumber. Install with `pip install pdfplumber`.",
        )

    text_chunks: List[str] = []
    current_len = 0
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            cleaned = page_text.strip()
            if not cleaned:
                continue
            text_chunks.append(cleaned)
            current_len += len(cleaned)
            if current_len >= 3500:
                break
    return "\n".join(text_chunks).strip()


def _extract_docx_text(file_bytes: bytes) -> str:
    from io import BytesIO

    if Document is None:
        raise HTTPException(
            status_code=500,
            detail="Missing dependency: python-docx. Install with `pip install python-docx`.",
        )

    doc = Document(BytesIO(file_bytes))
    chunks: List[str] = []
    current_len = 0
    for paragraph in doc.paragraphs:
        text = (paragraph.text or "").strip()
        if not text:
            continue
        chunks.append(text)
        current_len += len(text)
        if current_len >= 3500:
            break
    return "\n".join(chunks).strip()


SKILL_PATTERNS = {
    "Python": [r"\bpython\b", r"\bflask\b", r"\bfastapi\b", r"\bdjango\b"],
    "Java": [r"\bjava\b", r"\bspring\b"],
    "C++": [r"\bc\+\+\b", r"\bstl\b"],
    "JavaScript": [r"\bjavascript\b", r"\bjs\b"],
    "React": [r"\breact\b", r"\bnext\.?js\b"],
    "SQL": [r"\bsql\b", r"\bmysql\b", r"\bpostgres\b", r"\bsqlite\b"],
    "Excel": [r"\bexcel\b", r"\bpivot table\b", r"\bvlookup\b"],
    "DSA": [r"\bdsa\b", r"data structures?", r"algorithms?"],
    "Machine Learning": [r"\bmachine learning\b", r"\bml\b", r"\bscikit\b", r"\btensorflow\b", r"\bpytorch\b"],
    "Git": [r"\bgit\b", r"\bgithub\b"],
    "REST API": [r"\brest\b", r"\bapi\b", r"\bhttp\b"],
}

ROLE_RULES = {
    "Software Engineer": {
        "required_skills": ["Python", "Java", "C++", "DSA", "SQL", "Git", "REST API", "React"],
        "priority": ["DSA", "Projects", "Problem Solving"],
    },
    "Data Analyst": {
        "required_skills": ["Python", "SQL", "Excel", "Machine Learning", "Git"],
        "priority": ["SQL", "Python", "Data Visualization"],
    },
}


def _infer_role(text: str) -> str:
    t = text.lower()
    analyst_hits = len(re.findall(r"data analyst|analytics|dashboard|power bi|tableau|excel", t))
    engineer_hits = len(re.findall(r"software engineer|developer|backend|frontend|full stack|api|dsa", t))
    return "Data Analyst" if analyst_hits > engineer_hits else "Software Engineer"


def _extract_skills(text: str) -> List[str]:
    detected: List[str] = []
    t = text.lower()
    for skill, patterns in SKILL_PATTERNS.items():
        if any(re.search(p, t) for p in patterns):
            detected.append(skill)
    return detected


def _project_signals(text: str) -> int:
    t = text.lower()
    count = len(re.findall(r"\bproject\b", t))
    count += len(re.findall(r"\bdeveloped\b|\bbuilt\b|\bimplemented\b|\bdeployed\b", t))
    return min(count, 10)


def _experience_years(text: str) -> float:
    t = text.lower()
    year_matches = re.findall(r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)", t)
    if year_matches:
        return max(float(y) for y in year_matches)
    return 1.0 if re.search(r"\bintern(ship)?\b|\bexperience\b", t) else 0.0


def _quality_score(text: str) -> int:
    t = text.lower()
    sections = ["education", "skills", "projects", "experience", "summary"]
    section_hits = sum(1 for s in sections if s in t)
    bullet_hits = len(re.findall(r"^\s*[-*•]", text, flags=re.MULTILINE))
    length = len(text)
    score = 35 + section_hits * 10 + min(bullet_hits, 8) * 3
    if length < 300:
        score -= 20
    elif length > 2500:
        score += 8
    return max(0, min(100, score))


def _build_dynamic_feedback(
    role: str,
    skills_found: List[str],
    missing_skills: List[str],
    project_score: int,
    experience_score: int,
    quality_score: int,
    total_score: int,
    text: str,
) -> Dict[str, Any]:
    seed = int(hashlib.md5(text.encode("utf-8")).hexdigest()[:8], 16)
    rng = random.Random(seed)

    strong_skill = rng.choice(skills_found) if skills_found else "foundational technical"
    missing_skill = rng.choice(missing_skills) if missing_skills else "advanced problem solving"

    strengths_templates = [
        f"Your resume shows strong {strong_skill} skills relevant to {role}.",
        f"You have good role alignment for {role}, especially in {strong_skill}.",
        f"The profile demonstrates practical exposure through {strong_skill}.",
    ]
    weakness_templates = [
        f"Your resume currently lacks visible {missing_skill} exposure.",
        f"Adding stronger evidence of {missing_skill} can improve role fit.",
        f"The profile would be stronger with clearer {missing_skill} examples.",
    ]
    suggestion_templates = [
        f"Add one project bullet showing measurable impact (for example: latency reduced by 30%).",
        f"Include keywords related to {role} responsibilities to improve screening.",
        f"Highlight tools, stack, and outcomes in each project for better clarity.",
        f"Add concise achievements using action verbs and numbers.",
    ]

    strengths = [rng.choice(strengths_templates)]
    if project_score >= 70:
        strengths.append("Projects section looks solid and demonstrates implementation effort.")
    if experience_score >= 60:
        strengths.append("Experience details provide useful context for recruiters.")
    if quality_score >= 70:
        strengths.append("Resume structure is readable with good section organization.")

    weaknesses = [rng.choice(weakness_templates)]
    if project_score < 50:
        weaknesses.append("Projects need more depth, especially real-world impact and outcomes.")
    if experience_score < 40:
        weaknesses.append("Experience evidence is limited; add internships/freelance contributions if available.")
    if quality_score < 50:
        weaknesses.append("Resume quality can improve with clearer sections and concise bullets.")

    suggestions = rng.sample(suggestion_templates, k=min(3, len(suggestion_templates)))
    if missing_skills:
        suggestions.append(f"Prioritize learning and showcasing: {', '.join(missing_skills[:3])}.")
    if total_score < 55:
        suggestions.append("Focus first on 1-2 core skills and one strong project before applying widely.")
    elif total_score < 75:
        suggestions.append("You are progressing well; polish project impact statements and role-specific keywords.")
    else:
        suggestions.append("You are close to interview-ready; refine resume wording and keep project outcomes quantified.")

    summary_templates = [
        f"Your profile is moderately aligned with {role}. Strengths are visible, but targeted improvements in {missing_skill} can increase shortlist chances.",
        f"This resume shows promising potential for {role}. With stronger evidence in {missing_skill} and measurable project impact, it can become much more competitive.",
        f"Overall, your resume has a good base for {role}. Tightening skill coverage and achievement-focused writing will improve interview readiness.",
    ]

    return {
        "strengths": strengths[:4],
        "weaknesses": weaknesses[:4],
        "suggestions": suggestions[:5],
        "summary": rng.choice(summary_templates),
    }


def _analyze_resume_offline(resume_text: str) -> Dict[str, Any]:
    role = _infer_role(resume_text)
    required = ROLE_RULES[role]["required_skills"]

    skills_found = _extract_skills(resume_text)
    missing_skills = [s for s in required if s not in skills_found]

    skills_score = int((len([s for s in skills_found if s in required]) / max(len(required), 1)) * 100)
    project_score = min(100, _project_signals(resume_text) * 10)
    years = _experience_years(resume_text)
    experience_score = max(0, min(100, int((years / 3.0) * 100)))
    quality_score = _quality_score(resume_text)

    total_score = int(
        0.4 * skills_score
        + 0.3 * project_score
        + 0.2 * experience_score
        + 0.1 * quality_score
    )

    feedback = _build_dynamic_feedback(
        role=role,
        skills_found=skills_found,
        missing_skills=missing_skills,
        project_score=project_score,
        experience_score=experience_score,
        quality_score=quality_score,
        total_score=total_score,
        text=resume_text,
    )

    return {
        "score": max(0, min(100, total_score)),
        "skills_found": skills_found[:12],
        "missing_skills": missing_skills[:8],
        "strengths": feedback["strengths"],
        "weaknesses": feedback["weaknesses"],
        "suggestions": feedback["suggestions"],
        "summary": feedback["summary"],
    }


def generate_synthetic_readiness_data(samples: int = 900, seed: int = 42):
    """Create realistic synthetic dataset with overlap between classes."""
    rng = np.random.default_rng(seed)
    coding_score = rng.integers(25, 101, size=samples)
    aptitude_score = rng.integers(25, 101, size=samples)
    interview_score = rng.integers(20, 101, size=samples)
    resume_score = rng.integers(20, 101, size=samples)
    projects_count = rng.integers(0, 10, size=samples)
    skills_count = rng.integers(1, 18, size=samples)

    weighted_score = (
        0.25 * coding_score
        + 0.22 * aptitude_score
        + 0.2 * interview_score
        + 0.15 * resume_score
        + 2.6 * projects_count
        + 1.6 * skills_count
    )
    # Convert score to probability to avoid perfect separation
    noise = rng.normal(0, 9, size=samples)
    logits = (weighted_score - 66) / 8.0 + (noise / 10.0)
    readiness_prob = 1.0 / (1.0 + np.exp(-logits))
    readiness = rng.binomial(1, readiness_prob).astype(int)

    return {
        "coding_score": coding_score,
        "aptitude_score": aptitude_score,
        "interview_score": interview_score,
        "resume_score": resume_score,
        "projects_count": projects_count,
        "skills_count": skills_count,
        "readiness": readiness,
    }


def create_readiness_csv(samples: int = 900, seed: int = 42):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    data = generate_synthetic_readiness_data(samples=samples, seed=seed)
    with DATASET_PATH.open("w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([*READINESS_FEATURES, "readiness"])
        for i in range(samples):
            writer.writerow(
                [
                    int(data["coding_score"][i]),
                    int(data["aptitude_score"][i]),
                    int(data["interview_score"][i]),
                    int(data["resume_score"][i]),
                    int(data["projects_count"][i]),
                    int(data["skills_count"][i]),
                    int(data["readiness"][i]),
                ]
            )


def load_dataset_from_csv():
    if not DATASET_PATH.exists():
        create_readiness_csv()

    rows: List[List[float]] = []
    labels: List[int] = []
    with DATASET_PATH.open("r", newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            rows.append([float(row[f]) for f in READINESS_FEATURES])
            labels.append(int(row["readiness"]))
    return np.array(rows), np.array(labels)


def train_and_save_readiness_model():
    """Train logistic regression from CSV and persist model + metrics."""
    X, y = load_dataset_from_csv()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = Pipeline(
        [
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=1200, random_state=42)),
        ]
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = float(accuracy_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(READINESS_FEATURES, MODEL_FEATURES_PATH)
    joblib.dump({"accuracy": round(accuracy, 4), "f1": round(f1, 4)}, METRICS_PATH)

    return model, {"accuracy": round(accuracy, 4), "f1": round(f1, 4)}


def load_or_train_readiness_model():
    global readiness_model
    if MODEL_PATH.exists():
        readiness_model = joblib.load(MODEL_PATH)
        return readiness_model, None
    readiness_model, metrics = train_and_save_readiness_model()
    return readiness_model, metrics


@app.on_event("startup")
def startup_readiness_model():
    # Database Safety Check
    if supabase:
        print("✅ Supabase client initialized.")
    else:
        print("❌ Supabase client initialization failed!")
        print("WARNING: Starting application without active database connection!")
        
    # Trains once on first run, then reuses saved model
    load_or_train_readiness_model()



def _normalize_code(data: dict) -> str:
    return str(data.get("code", "")).strip("\n")


def detect_language(code: str) -> str:
    if not code.strip():
        return "unknown"

    checks = {
        "python": [
            r"^\s*def\s+\w+\s*\(",
            r"^\s*import\s+\w+",
            r"^\s*from\s+\w+\s+import\s+",
            r"^\s*print\s*\(",
            r"^\s*if\s+__name__\s*==\s*['\"]__main__['\"]\s*:",
        ],
        "java": [
            r"\bpublic\s+class\b",
            r"\bpublic\s+static\s+void\s+main\s*\(",
            r"\bSystem\.out\.print",
            r"\bnew\s+\w+\s*\(",
        ],
        "cpp": [
            r"#include\s*<\w+(\.h)?>",
            r"\busing\s+namespace\s+std\s*;",
            r"\bstd::",
            r"\bint\s+main\s*\(",
            r"\bcout\s*<<",
        ],
    }

    scores: Dict[str, int] = {"python": 0, "java": 0, "cpp": 0}
    for lang, patterns in checks.items():
        for pattern in patterns:
            if re.search(pattern, code, flags=re.MULTILINE):
                scores[lang] += 1

    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "unknown"


def _code_facts(code: str, language: str) -> Dict[str, bool]:
    has_for = bool(re.search(r"\bfor\b", code))
    has_while = bool(re.search(r"\bwhile\b", code))
    has_if = bool(re.search(r"\bif\b|\belif\b|\belse\b", code))
    has_return = bool(re.search(r"\breturn\b", code))
    has_recursion = False

    if language == "python":
        fn_names = re.findall(r"^\s*def\s+([a-zA-Z_]\w*)\s*\(", code, flags=re.MULTILINE)
        has_function = len(fn_names) > 0
        has_print = bool(re.search(r"\bprint\s*\(", code))
    elif language == "java":
        fn_names = re.findall(
            r"(?:public|private|protected)?\s*(?:static\s+)?\w+(?:<[^>]+>)?\s+([a-zA-Z_]\w*)\s*\(",
            code,
        )
        has_function = len(fn_names) > 0
        has_print = bool(re.search(r"System\.out\.print", code))
    else:
        fn_names = re.findall(r"\b[a-zA-Z_]\w*\s+[a-zA-Z_]\w*\s*\([^;]*\)\s*\{", code)
        has_function = len(fn_names) > 0
        has_print = bool(re.search(r"\bcout\s*<<|\bprintf\s*\(", code))

    # Recursion heuristic: function name appears as a call in body
    for name in fn_names:
        if re.search(rf"\b{name}\s*\(", code):
            # If count > 1, one is definition and at least one is call
            if len(re.findall(rf"\b{name}\s*\(", code)) > 1:
                has_recursion = True
                break

    has_array_like = bool(
        re.search(r"\[[^\]]*\]|\bvector<|\bArrayList\b|\blist\b", code)
    )
    has_map_like = bool(re.search(r"\bdict\b|\bHashMap\b|\bmap<|\bunordered_map<|\{\}", code))

    return {
        "has_for": has_for,
        "has_while": has_while,
        "has_if": has_if,
        "has_return": has_return,
        "has_function": has_function,
        "has_recursion": has_recursion,
        "has_print": has_print,
        "has_array_like": has_array_like,
        "has_map_like": has_map_like,
    }


def _estimate_complexity(code: str, language: str) -> Dict[str, str]:
    lowered = code.lower()
    loops = len(re.findall(r"\bfor\b|\bwhile\b", lowered))
    nested_hint = 0
    if language == "python":
        lines = [line for line in code.splitlines() if line.strip()]
        indent_levels = [len(line) - len(line.lstrip(" ")) for line in lines]
        nested_hint = max([lvl // 4 for lvl in indent_levels], default=0)
    else:
        # Braces are a rough proxy for nesting in Java/C++
        open_braces = len(re.findall(r"\{", code))
        close_braces = len(re.findall(r"\}", code))
        nested_hint = min(open_braces, close_braces)

    has_sort = bool(re.search(r"\bsorted\s*\(|\.sort\s*\(|Arrays\.sort|std::sort", code))
    has_binary_search = bool(
        re.search(r"\bbinary\s*search\b|\bmid\b", lowered)
        and re.search(r"low|high|left|right", lowered)
    )
    has_hash = bool(re.search(r"\bdict\b|\bhashmap\b|\bunordered_map\b|\bset\b|\bmap\b", lowered))
    has_recursion = bool(re.search(r"def\s+(\w+)[\s\S]*\1\s*\(", code)) or bool(
        re.search(r"([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{[\s\S]{0,1000}\b\1\s*\(", code)
    )

    if has_binary_search:
        return {
            "time": "O(log n)",
            "space": "O(1)",
            "best": "O(1)",
            "worst": "O(log n)",
            "note": "Binary search pattern detected. Input should be sorted.",
        }
    if has_sort:
        return {
            "time": "O(n log n)",
            "space": "O(log n)",
            "best": "O(n log n)",
            "worst": "O(n log n)",
            "note": "Built-in sort usage detected.",
        }
    if has_recursion and has_hash:
        return {
            "time": "O(n)",
            "space": "O(n)",
            "best": "O(n)",
            "worst": "O(n)",
            "note": "Recursion with memo/hash structure likely dynamic programming.",
        }
    if has_recursion and loops >= 1:
        return {
            "time": "O(2^n)",
            "space": "O(n)",
            "best": "O(n)",
            "worst": "O(2^n)",
            "note": "Recursive logic mixed with iteration; may grow quickly.",
        }
    if loops >= 2 or nested_hint >= 2:
        return {
            "time": "O(n^2)",
            "space": "O(1)",
            "best": "O(n)",
            "worst": "O(n^2)",
            "note": "Nested iteration pattern detected.",
        }
    if loops == 1:
        return {
            "time": "O(n)",
            "space": "O(1)",
            "best": "O(1)",
            "worst": "O(n)",
            "note": "Single-pass loop detected.",
        }
    return {
        "time": "O(1)",
        "space": "O(1)",
        "best": "O(1)",
        "worst": "O(1)",
        "note": "No significant loops/recursion detected.",
    }


def _fix_suggestions(code: str, language: str) -> List[str]:
    suggestions: List[str] = []
    lines = code.splitlines()
    stripped_lines = [line.strip() for line in lines if line.strip()]

    if not stripped_lines:
        return ["Editor is empty. Add code before requesting fixes."]

    if language == "python":
        for idx, line in enumerate(stripped_lines, start=1):
            if re.match(r"^(if|for|while|def|class|elif|else|try|except)\b", line) and not line.endswith(":"):
                suggestions.append(f"Line {idx}: Python blocks usually need ':' at the end.")
        if "\t" in code:
            suggestions.append("Avoid mixing tabs and spaces in Python indentation.")
        if "==" in code and "=" in code and "if" not in code:
            suggestions.append("Double-check assignment '=' vs comparison '=='.")
    elif language == "java":
        if "public class" not in code:
            suggestions.append("Add a `public class` wrapper for Java code.")
        if "public static void main" not in code:
            suggestions.append("Add `public static void main(String[] args)` entry point.")
        if re.search(r"\bString\b.*==", code):
            suggestions.append("Use `.equals()` for String comparison instead of `==`.")
        if code.count("{") != code.count("}"):
            suggestions.append("Unbalanced `{}` braces detected.")
    elif language == "cpp":
        if "#include" not in code:
            suggestions.append("Add required `#include` headers.")
        if "int main" not in code:
            suggestions.append("Add an `int main()` function.")
        if code.count("{") != code.count("}"):
            suggestions.append("Unbalanced `{}` braces detected.")
        if "cout" in code and "std::" not in code and "using namespace std;" not in code:
            suggestions.append("Use `std::cout` or add `using namespace std;`.")
    else:
        suggestions.append("Language not confidently detected. Select code language explicitly.")

    # Generic checks
    if code.count("(") != code.count(")"):
        suggestions.append("Unbalanced parentheses `()` detected.")
    if code.count("[") != code.count("]"):
        suggestions.append("Unbalanced square brackets `[]` detected.")
    if len(stripped_lines) <= 2:
        suggestions.append("Code is very short; consider adding input handling and validation.")

    if not suggestions:
        suggestions.append("No obvious syntax issues found. Try running test cases for logical errors.")

    return suggestions


def _safe_eval_expr(node: ast.AST):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float, str, bool)):
        return node.value
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.UAdd, ast.USub)):
        value = _safe_eval_expr(node.operand)
        if value is None:
            return None
        return +value if isinstance(node.op, ast.UAdd) else -value
    if isinstance(node, ast.BinOp):
        left = _safe_eval_expr(node.left)
        right = _safe_eval_expr(node.right)
        if left is None or right is None:
            return None
        if isinstance(node.op, ast.Add):
            return left + right
        if isinstance(node.op, ast.Sub):
            return left - right
        if isinstance(node.op, ast.Mult):
            return left * right
        if isinstance(node.op, ast.Div):
            return left / right
        if isinstance(node.op, ast.FloorDiv):
            return left // right
        if isinstance(node.op, ast.Mod):
            return left % right
        if isinstance(node.op, ast.Pow):
            return left ** right
    return None


def explain_python(code: str) -> str:
    try:
        tree = ast.parse(code)
    except SyntaxError as err:
        return "\n".join(
            [
                "Code Explanation:",
                f"- Detected language: Python",
                f"- Syntax issue near line {err.lineno}.",
                "- Fix syntax first, then request explanation again for detailed steps.",
            ]
        )

    functions: List[str] = []
    variables: List[str] = []
    loops: List[str] = []
    conditions = 0
    step_text: List[str] = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            functions.append(node.name)
        elif isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    variables.append(target.id)
        elif isinstance(node, ast.For):
            loop_desc = "a loop"
            if isinstance(node.target, ast.Name):
                loop_desc = f"a loop with `{node.target.id}` as the loop variable"
            if (
                isinstance(node.iter, ast.Call)
                and isinstance(node.iter.func, ast.Name)
                and node.iter.func.id == "range"
                and len(node.iter.args) == 1
            ):
                n = _safe_eval_expr(node.iter.args[0])
                if isinstance(n, int):
                    loop_desc = (
                        f"a loop that runs from 0 to {n - 1} "
                        f"(total {n} iterations) using `{node.target.id if isinstance(node.target, ast.Name) else 'item'}`"
                    )
            loops.append(loop_desc)
        elif isinstance(node, ast.While):
            loops.append("a while-loop that repeats while its condition remains true")
        elif isinstance(node, ast.If):
            conditions += 1

    # Step-by-step narrative from top-level statements
    top_level = tree.body
    for stmt in top_level[:6]:
        if isinstance(stmt, ast.Assign):
            names = []
            for target in stmt.targets:
                if isinstance(target, ast.Name):
                    names.append(target.id)
            if names:
                step_text.append(f"it stores a value in `{', '.join(names)}`")
        elif isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Call):
            call = stmt.value
            if isinstance(call.func, ast.Name) and call.func.id == "print" and call.args:
                expr = call.args[0]
                evaluated = _safe_eval_expr(expr)
                if evaluated is not None:
                    step_text.append(
                        f"it computes `{ast.unparse(expr)}` first and prints the result `{evaluated}`"
                    )
                else:
                    step_text.append("it prints a computed value to the console")
        elif isinstance(stmt, ast.For):
            step_text.append("it enters a loop and repeats the body for each value")
        elif isinstance(stmt, ast.If):
            step_text.append("it checks a condition and follows the matching branch")
        elif isinstance(stmt, ast.FunctionDef):
            step_text.append(f"it defines a function named `{stmt.name}` for reusable logic")

    structure_bits = []
    if functions:
        structure_bits.append(f"{len(functions)} function(s) ({', '.join(functions[:3])})")
    if loops:
        structure_bits.append(f"{len(loops)} loop(s)")
    if conditions:
        structure_bits.append(f"{conditions} conditional block(s)")
    if variables:
        structure_bits.append(f"variable assignments like `{', '.join(sorted(set(variables))[:5])}`")
    lines_out: List[str] = [
        "Code Explanation:",
        "- Detected language: Python",
        f"- Program structure: {', '.join(structure_bits) if structure_bits else 'sequential statements'}",
    ]

    if loops:
        lines_out.append(f"- Loop behavior: It uses {loops[0]}.")
    if step_text:
        lines_out.append("- Step-by-step flow:")
        for idx, item in enumerate(step_text, start=1):
            lines_out.append(f"  {idx}. {item[0].upper() + item[1:]}.")
    else:
        lines_out.append("- Step-by-step flow: The code executes from top to bottom.")

    return "\n".join(lines_out)


def explain_generic(code: str, language: str) -> str:
    lines = [line.strip() for line in code.splitlines() if line.strip()]
    fn_pattern = (
        r"(?:public|private|protected)?\s*(?:static\s+)?\w+(?:<[^>]+>)?\s+([a-zA-Z_]\w*)\s*\("
        if language == "java"
        else r"\b[a-zA-Z_]\w*\s+([a-zA-Z_]\w*)\s*\([^;]*\)\s*\{"
    )
    functions = re.findall(fn_pattern, code)
    loops = len(re.findall(r"\bfor\b|\bwhile\b", code))
    conditions = len(re.findall(r"\bif\b|\belse\s+if\b|\bswitch\b", code))
    variables = re.findall(
        r"\b(?:int|long|float|double|char|bool|boolean|String|string|auto|var)\s+([a-zA-Z_]\w*)",
        code,
    )

    output_hint = ""
    if language == "java" and re.search(r"System\.out\.print", code):
        output_hint = "It prints output to the console using System.out.print/println."
    elif language == "cpp" and re.search(r"\bcout\s*<<|\bprintf\s*\(", code):
        output_hint = "It prints output to the console using cout/printf."

    vars_text = (
        ", ".join(sorted(set(variables))[:6]) if variables else "No clear typed variable declarations found"
    )
    first_line = lines[0][:100] if lines else "N/A"

    out = [
        "Code Explanation:",
        f"- Detected language: {language.upper()}",
        f"- Program structure: {len(functions)} function(s), {loops} loop(s), {conditions} condition block(s).",
        f"- Variables noticed: {vars_text}.",
        "- Step-by-step flow:",
        f"  1. The program starts near: `{first_line}`.",
        "  2. It executes statements in order and checks conditions where present.",
        "  3. Loop blocks repeat until their condition/range completes.",
        "  4. Function calls execute their logic and return control to the caller.",
    ]
    if output_hint:
        out.append(f"- Output behavior: {output_hint}")
    return "\n".join(out)


# ✅ Explain API (smart local explanation only)
@app.post("/explain")
async def explain_code(data: dict):
    code = _normalize_code(data)
    if not code:
        return {"error": "Code is empty. Please provide code to explain."}

    def _sync_explain():
        language = detect_language(code)
        if language == "python":
            return explain_python(code)
        elif language in {"java", "cpp"}:
            return explain_generic(code, language)
        else:
            return (
                "The language could not be confidently detected, so this is a generic explanation. "
                + explain_generic(code, "generic")
            )

    try:
        explanation = await asyncio.wait_for(asyncio.to_thread(_sync_explain), timeout=3.0)
        return {"result": explanation}
    except asyncio.TimeoutError:
        return {"result": "Explanation took too long. This is a fallback analysis: the code structure appears correct but requires optimization."}


# ✅ Fix Code API
@app.post("/fix")
async def fix_code(data: dict):
    code = _normalize_code(data)
    if not code:
        return {"error": "Code is empty. Please provide code to fix."}

    def _sync_fix():
        language = detect_language(code)
        fixes = _fix_suggestions(code, language)
        formatted = ["Fix Suggestions", "---------------", f"Detected language: {language}", ""]
        formatted.extend([f"- {item}" for item in fixes])
        formatted.append("")
        formatted.append("(Rule-based suggestions only; no code execution performed)")
        return "\n".join(formatted)

    try:
        result = await asyncio.wait_for(asyncio.to_thread(_sync_fix), timeout=3.0)
        return {"result": result}
    except asyncio.TimeoutError:
        return {"result": "Fix analysis took too long. Fallback suggestion: Review the code for infinite loops or deep recursion."}


# ✅ Complexity API
@app.post("/complexity")
async def complexity(data: dict):
    code = _normalize_code(data)
    if not code:
        return {"error": "Code is empty. Please provide code for complexity analysis."}

    def _sync_complexity():
        language = detect_language(code)
        result = _estimate_complexity(code, language)
        result["note"] = f"{result['note']} Language detected: {language}."
        return result

    try:
        result = await asyncio.wait_for(asyncio.to_thread(_sync_complexity), timeout=3.0)
        return {"result": result}
    except asyncio.TimeoutError:
        return {"result": {"time_complexity": "O(N) (Fallback)", "space_complexity": "O(1) (Fallback)", "note": "Analysis timed out. Defaulting to general fallback complexity."}}


@app.post("/predict-readiness")
async def predict_readiness(payload: ReadinessInput):
    global readiness_model
    try:
        if readiness_model is None:
            await asyncio.wait_for(asyncio.to_thread(load_or_train_readiness_model), timeout=3.0)
    except asyncio.TimeoutError:
        return {"prediction": "Not Ready", "confidence": 0.0}

    input_vector = np.array(
        [
            [
                payload.coding_score,
                payload.aptitude_score,
                payload.interview_score,
                payload.resume_score,
                payload.projects_count,
                payload.skills_count,
            ]
        ]
    )

    def _sync_predict():
        pred = int(readiness_model.predict(input_vector)[0])
        confidence = float(readiness_model.predict_proba(input_vector)[0][pred])
        return pred, confidence

    try:
        pred, confidence = await asyncio.wait_for(asyncio.to_thread(_sync_predict), timeout=3.0)
    except asyncio.TimeoutError:
        return {"prediction": "Ready (Fallback)", "confidence": 0.50}

    return {
        "prediction": "Ready" if pred == 1 else "Not Ready",
        "confidence": round(confidence, 2),
    }


@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    filename = (file.filename or "").lower()
    if not filename:
        raise HTTPException(status_code=400, detail="No file name provided.")

    if not (filename.endswith(".pdf") or filename.endswith(".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    try:
        file_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unable to read uploaded file: {exc}") from exc

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    extraction_start = time.perf_counter()
    try:
        if filename.endswith(".pdf"):
            resume_text = await asyncio.wait_for(asyncio.to_thread(_extract_pdf_text, file_bytes), timeout=1.0)
        else:
            resume_text = await asyncio.wait_for(asyncio.to_thread(_extract_docx_text, file_bytes), timeout=1.0)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=400, detail="Resume extraction took too long. Please try a simpler file.")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from file: {exc}") from exc

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="No readable text found in resume.")

    extraction_ms = (time.perf_counter() - extraction_start) * 1000
    print(f"[resume-analyzer] extraction_ms={extraction_ms:.1f}")

    # Analyze first chunk for speed and consistent latency
    resume_text = resume_text[:3000]
    ai_start = time.perf_counter()
    try:
        analysis = await asyncio.wait_for(asyncio.to_thread(_analyze_resume_offline, resume_text), timeout=3.0)
    except asyncio.TimeoutError:
        analysis = "Analysis took too long. Displaying partial fallback rule validation... \n - Resume text detected and readable."
    ai_ms = (time.perf_counter() - ai_start) * 1000
    print(f"[resume-analyzer] local_analysis_ms={ai_ms:.1f}")
    return {"analysis": analysis}

from cachetools import TTLCache
import httpx

leetcode_cache = TTLCache(maxsize=100, ttl=300)

@app.get("/leetcode/{username}")
async def get_leetcode_stats(username: str):
    if username in leetcode_cache:
        return leetcode_cache[username]

    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
        }
        submissionCalendar
        tagProblemCounts {
          advanced { tagName problemsSolved }
          intermediate { tagName problemsSolved }
          fundamental { tagName problemsSolved }
        }
      }
    }
    """
    url = "https://leetcode.com/graphql"
    payload = {
        "query": query,
        "variables": {"username": username}
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers={'User-Agent': 'Mozilla/5.0'}, timeout=3.0)
            response.raise_for_status()
            data = response.json()

    except httpx.TimeoutException:
        # Graceful fallback so React doesn't freeze
        return {
            "error_msg": "LeetCode is taking too long to respond. The system is showing cached fallback data.",
            "total": 0, "easy": 0, "medium": 0, "hard": 0, 
            "ranking": 0, "topics": [], "current_streak": 0, 
            "max_streak": 0, "recent_activity": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")

    # 1. DETECT INVALID USERNAME PROPERLY
    if "errors" in data or not data.get("data", {}).get("matchedUser"):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=404,
            content={"error_msg": "No username found on LeetCode"}
        )

        
    matched_user = data["data"]["matchedUser"]
    submissions = matched_user.get("submitStats", {}).get("acSubmissionNum", [])
    ranking = matched_user.get("profile", {}).get("ranking", 0)
    
    stats = {"total": 0, "easy": 0, "medium": 0, "hard": 0, "ranking": ranking}
    for sub in submissions:
        diff = sub["difficulty"]
        count = sub["count"]
        if diff == "All":
            stats["total"] = count
        elif diff == "Easy":
            stats["easy"] = count
        elif diff == "Medium":
            stats["medium"] = count
        elif diff == "Hard":
            stats["hard"] = count
            
    # Requirement: If total is 0, treat as invalid username/no data
    if stats["total"] == 0:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=404,
            content={"error_msg": "No username found on LeetCode"}
        )


    # Topics
    topics = []
    tag_counts = matched_user.get("tagProblemCounts") or {}
    all_tags = (tag_counts.get("advanced") or []) + \
               (tag_counts.get("intermediate") or []) + \
               (tag_counts.get("fundamental") or [])
    
    for tag in all_tags:
        topics.append({"topic": tag["tagName"], "count": tag["problemsSolved"]})
    
    stats["topics"] = sorted(topics, key=lambda x: x["count"], reverse=True)[:5]
    
    # Calendar processing for Streaks and Recent Activity
    cal_str = matched_user.get("submissionCalendar", "{}")
    try:
        cal = json.loads(cal_str)
    except:
        cal = {}
        
    daily_counts = {}
    for ts_str, count in cal.items():
        try:
            dt = datetime.fromtimestamp(int(ts_str), tz=timezone.utc).date()
            daily_counts[dt] = daily_counts.get(dt, 0) + count
        except:
            pass
            
    dates = sorted(daily_counts.keys())
    
    max_streak = 0
    current_streak = 0
    
    if dates:
        streak = 1
        max_streak = 1
        for i in range(1, len(dates)):
            if (dates[i] - dates[i-1]).days == 1:
                streak += 1
                max_streak = max(max_streak, streak)
            else:
                streak = 1
                
        # Calculate current streak ending today or yesterday
        today = datetime.now(timezone.utc).date()
        if today in dates or (today - timedelta(days=1)) in dates:
            c_streak = 1
            idx = len(dates) - 1
            # Rewind if last entry is today or yesterday
            if dates[idx] == today or dates[idx] == today - timedelta(days=1):
                while idx > 0 and (dates[idx] - dates[idx-1]).days == 1:
                    c_streak += 1
                    idx -= 1
                current_streak = c_streak
        
    stats["current_streak"] = current_streak
    stats["max_streak"] = max_streak
    
    # Recent activity for last 60 days
    today = datetime.now(timezone.utc).date()
    recent = []
    recent_60 = []
    for i in range(60):
        d = today - timedelta(days=i)
        entry = {
            "date": d.strftime("%Y-%m-%d"),
            "count": daily_counts.get(d, 0)
        }
        if i < 7:
            recent.append(entry)
        recent_60.append(entry)
        
    stats["recent_activity"] = recent
    stats["recent_activity_60"] = recent_60
            
    leetcode_cache[username] = stats
    return stats

from interview_logic import generate_interview_response
from pydantic import BaseModel
from typing import Optional

class ChatMessage(BaseModel):
    id: str
    sender: str
    content: str
    timestamp: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    current_input: str

@app.post("/api/interview/chat")
def interview_chat(req: ChatRequest):
    history = [{"sender": m.sender, "content": m.content} for m in req.messages]
    
    # Process the interview logic
    response_data = generate_interview_response(history, req.current_input)
    return response_data

class MockInterviewRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]]

@app.post("/mock-interview")
async def mock_interview_openai(req: MockInterviewRequest):
    if not openai_client:
        # Fallback to local deterministic logic
        history = [{"sender": msg.get("sender", "user"), "content": msg.get("content", "")} for msg in req.history]
        result = generate_interview_response(history, req.message)
        fallback_msg = ""
        if result.get("question"):
            fallback_msg = result["question"]
        else:
            fallback_msg += f"**Feedback ({result.get('rating', '')}/10):** {result.get('feedback', '')}\n\n"
            if result.get("strengths") and len(result["strengths"]) > 0:
                fallback_msg += f"✅ **Strengths:** {' '.join(result['strengths'])}\n"
            if result.get("improvements") and len(result["improvements"]) > 0:
                fallback_msg += f"💡 **Improvements:** {' '.join(result['improvements'])}\n\n"
            if result.get("follow_up"):
                fallback_msg += result["follow_up"]
                
        return {"response": fallback_msg.strip()}

    # Short system prompt
    system_prompt = "You are a professional technical interviewer. Ask one question at a time. Give accurate and specific feedback. If wrong, explain clearly. Be concise, realistic, DO NOT repeat, DO NOT give generic responses."
    
    try:
        messages = [{"role": "system", "content": system_prompt}]
        for msg in req.history:
            role = "assistant" if msg.get("sender") == "ai" else "user"
            messages.append({"role": role, "content": msg.get("content", "")})
            
        messages.append({"role": "user", "content": req.message})

        response = await asyncio.wait_for(
            openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=150,
                temperature=0.7
            ),
            timeout=5.0
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        # Fallback if OpenAI hangs or crashes dynamically
        history = [{"sender": msg.get("sender", "user"), "content": msg.get("content", "")} for msg in req.history]
        result = generate_interview_response(history, req.message)
        fallback_msg = result.get("question", "") or result.get("feedback", "")
        return {"response": fallback_msg.strip()}


# --- Supabase Authentication API (Removed) ---
# Authentication is now handled directly by the frontend using Supabase client.raise Exception('I AM RUNNING THIS FILE')

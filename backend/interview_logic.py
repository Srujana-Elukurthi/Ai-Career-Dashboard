import random
import re
from typing import Dict, Any, List

QUESTION_BANK = {
    "technical": [
        {"q": "Explain how REST APIs work in a scalable system.", "difficulty": "Medium"},
        {"q": "What is the difference between a process and a thread?", "difficulty": "Easy"},
        {"q": "How does Redis or Memcached improve application performance?", "difficulty": "Medium"},
        {"q": "Explain the concept of containerization using Docker.", "difficulty": "Easy"},
        {"q": "How would you design a URL shortener like bit.ly?", "difficulty": "Hard"},
        {"q": "What are microservices and how do they differ from monolithic architectures?", "difficulty": "Medium"},
        {"q": "Explain indexing in databases and how it impacts query speed.", "difficulty": "Medium"},
        {"q": "Describe the CAP theorem and its implications in distributed systems.", "difficulty": "Hard"},
        {"q": "What is event-driven architecture and when would you use it?", "difficulty": "Hard"},
        {"q": "Explain the difference between TCP and UDP protocols.", "difficulty": "Easy"},
        {"q": "How do you secure a REST API?", "difficulty": "Medium"},
        {"q": "What is horizontal vs vertical scaling?", "difficulty": "Easy"}
    ],
    "behavioral": [
        {"q": "Tell me about a time you handled a difficult teammate.", "difficulty": "Medium"},
        {"q": "Describe a project that failed and what you learned from it.", "difficulty": "Hard"},
        {"q": "How do you prioritize your work when facing strict deadlines?", "difficulty": "Easy"},
        {"q": "Tell me about a time you had to learn quickly on the job.", "difficulty": "Medium"},
        {"q": "Describe a situation where you strongly disagreed with your manager.", "difficulty": "Hard"},
        {"q": "Tell me about a time you went above and beyond for a project.", "difficulty": "Medium"},
        {"q": "How do you handle receiving critical feedback?", "difficulty": "Medium"},
        {"q": "Give an example of a goal you reached and how you achieved it.", "difficulty": "Easy"},
        {"q": "Tell me about a time you demonstrated leadership without having the title.", "difficulty": "Hard"},
        {"q": "How do you keep your technical knowledge up to date?", "difficulty": "Easy"}
    ],
    "hr": [
        {"q": "Why are you interested in this position?", "difficulty": "Easy"},
        {"q": "What are your greatest professional strengths?", "difficulty": "Easy"},
        {"q": "What do you consider to be your weaknesses?", "difficulty": "Medium"},
        {"q": "Where do you see yourself in five years?", "difficulty": "Easy"},
        {"q": "Why should we hire you over other candidates?", "difficulty": "Medium"},
        {"q": "Tell me about a time you had to adapt to a major change at work.", "difficulty": "Medium"},
        {"q": "What is your preferred work environment?", "difficulty": "Easy"},
        {"q": "How do you handle stress and pressure?", "difficulty": "Medium"},
        {"q": "What are your salary expectations?", "difficulty": "Hard"},
        {"q": "What is your proudest professional achievement?", "difficulty": "Medium"}
    ],
    "coding": [
        {"q": "Optimize an algorithm to find duplicates in an array to O(n) time.", "difficulty": "Medium"},
        {"q": "How would you reverse a linked list iteratively and recursively?", "difficulty": "Medium"},
        {"q": "Explain the concept of Dynamic Programming with an example like Fibonacci.", "difficulty": "Medium"},
        {"q": "How would you find the lowest common ancestor of two nodes in a Binary Tree?", "difficulty": "Hard"},
        {"q": "Implement an LRU Cache. What data structures would you use?", "difficulty": "Hard"},
        {"q": "Explain how you would detect a cycle in a directed graph.", "difficulty": "Medium"},
        {"q": "How do you implement a binary search tree insertion?", "difficulty": "Easy"},
        {"q": "Describe an algorithm to merge two sorted arrays efficiently.", "difficulty": "Easy"},
        {"q": "How do you solve the Two Sum problem optimally?", "difficulty": "Easy"},
        {"q": "Explain A* search algorithm and its use cases.", "difficulty": "Hard"}
    ]
}

def evaluate_answer(answer: str, category: str) -> Dict[str, Any]:
    words = len(answer.split())
    
    # Very short answers
    if words < 10:
        return {
            "rating": random.randint(3, 5),
            "feedback": "Your answer is quite brief. Interviews are opportunities to showcase your deep understanding.",
            "strengths": ["Clear and direct."],
            "weaknesses": ["Lacks detail and technical depth.", "Too short for a comprehensive evaluation."],
            "improvements": ["Elaborate on your points using specific examples.", "Use the STAR method for behavioral answers."]
        }
    
    rating = min(10, max(5, int(words / 15) + 4)) # Length correlates loosely with effort in mock
    
    strengths = ["Good articulation of your thoughts."]
    weaknesses = []
    improvements = []
    
    lower_ans = answer.lower()
    
    if category == "technical" or category == "coding":
        if re.search(r'\b(because|time|space|complexity|o\(|scalable|memory)\b', lower_ans):
            strengths.append("Mentions key technical considerations like scalability or complexity.")
            rating += 1
        else:
            weaknesses.append("Lacks discussion on trade-offs or efficiency.")
            improvements.append("Always discuss time and space complexity or system trade-offs.")
            
        if re.search(r'\b(example|instance|project|used)\b', lower_ans):
            strengths.append("Backs up theoretical knowledge with practical context.")
        else:
            weaknesses.append("Very theoretical.")
            improvements.append("Try linking concepts to actual times you used them.")
            
    elif category == "behavioral":
        if re.search(r'\b(situation|task|action|result|i did|we did)\b', lower_ans):
            strengths.append("Follows a structured storytelling approach.")
            rating += 1
        else:
            weaknesses.append("The story lacks clear structure.")
            improvements.append("Try using the STAR format (Situation, Task, Action, Result) to frame your response.")
            
        if re.search(r'\b(learned|improved|resolved)\b', lower_ans):
            strengths.append("Shows focus on outcomes and learning.")
            
    elif category == "hr":
        if re.search(r'\b(goal|vision|align|growth|passion)\b', lower_ans):
            strengths.append("Demonstrates clear alignment with professional growth.")
            rating += 1
        else:
            weaknesses.append("Response feels a bit generic.")
            improvements.append("Tailor your answer more specifically to the company or role you envision.")
            
    if words > 100:
        weaknesses.append("Slightly verbose.")
        improvements.append("Try to make your answers more concise to keep the interviewer engaged.")
        rating = min(10, rating - 1)
        
    rating = min(10, rating)
    
    feedback_intro = "Good effort. " if rating >= 7 else "Needs some work. "
    feedback_text = feedback_intro + "Your response covers the basics but could be refined."
    if not weaknesses:
        feedback_text = "Excellent answer! You structured your response very well."
        
    return {
        "rating": rating,
        "feedback": feedback_text,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvements": improvements
    }

def generate_follow_up(answer: str, category: str) -> str:
    templates = [
        "That's interesting. Can you elaborate on the most challenging part of that?",
        "Could you provide a specific example to illustrate your point?",
        "How would your approach change if the scale of the problem was 10x larger?",
        "What trade-offs did you consider when taking that approach?",
        "If you could do it again, what would you do differently?",
        "Why did you choose that specific solution over alternatives?"
    ]
    return random.choice(templates)

def generate_interview_response(history: List[Dict[str, Any]], current_input: str) -> Dict[str, Any]:
    # Determine Intent from current input
    lower_input = current_input.lower()
    
    # 1. User is selecting a category
    prompt_match = None
    if any(k in lower_input for k in ["technical", "tech"]): prompt_match = "technical"
    elif any(k in lower_input for k in ["behavioral", "behavior"]): prompt_match = "behavioral"
    elif "hr" in lower_input or "human resource" in lower_input: prompt_match = "hr"
    elif any(k in lower_input for k in ["coding", "algorithm", "dsa", "problem"]): prompt_match = "coding"
    
    if prompt_match:
        # Pick a question they haven't seen in this session
        asked_questions = [msg.get("content", "") for msg in history if msg.get("sender") == "ai"]
        available = [q for q in QUESTION_BANK[prompt_match] if q["q"] not in "?".join(asked_questions)]
        
        if not available:
            available = QUESTION_BANK[prompt_match] # Reset if exhausted
            
        selected_q = random.choice(available)["q"]
        
        return {
            "question": f"Great! Let's do a {prompt_match} question:\n\n{selected_q}",
            "follow_up": None,
            "feedback": None,
            "rating": None,
            "category_state": prompt_match
        }
        
    # 2. User is answering a question
    # We must deduce the category from the last AI question if possible
    category_state = "technical" # default
    last_ai_msg = None
    for msg in reversed(history):
        if msg.get("sender") == "ai":
            last_ai_msg = msg.get("content", "").lower()
            break
            
    if last_ai_msg:
        if "behavior" in last_ai_msg: category_state = "behavioral"
        elif "hr" in last_ai_msg or "career" in last_ai_msg: category_state = "hr"
        elif "coding" in last_ai_msg or "algorithm" in last_ai_msg: category_state = "coding"
        
    # Evaluate the answer
    eval_result = evaluate_answer(current_input, category_state)
    
    # Check if we should ask a follow-up or move to a new question
    # Heuristic: If they just answered a base question, ask follow-up. 
    # If they answered a follow-up, give final eval and ask them what to do next.
    is_follow_up_answer = last_ai_msg and ("elaborate" in last_ai_msg or "example" in last_ai_msg or "trade-off" in last_ai_msg or "differently" in last_ai_msg or "alternatives" in last_ai_msg)
    
    if not is_follow_up_answer and len(current_input.split()) > 5:
        follow_up = generate_follow_up(current_input, category_state)
        return {
            "question": None,
            "follow_up": follow_up,
            "feedback": eval_result["feedback"],
            "rating": eval_result["rating"],
            "strengths": eval_result["strengths"],
            "weaknesses": eval_result["weaknesses"],
            "improvements": eval_result["improvements"]
        }
    else:
        # Wrap up this thread
        return {
            "question": "Would you like to try another question? Just tell me the category (Technical, Behavioral, HR, Coding).",
            "follow_up": None,
            "feedback": eval_result["feedback"],
            "rating": eval_result["rating"],
            "strengths": eval_result["strengths"],
            "weaknesses": eval_result["weaknesses"],
            "improvements": eval_result["improvements"]
        }

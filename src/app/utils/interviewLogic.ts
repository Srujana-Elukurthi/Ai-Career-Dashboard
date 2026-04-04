export const QUESTION_BANK: Record<string, { q: string; difficulty: string }[]> = {
    technical: [
        { q: "Explain how REST APIs work in a scalable system.", difficulty: "Medium" },
        { q: "What is the difference between a process and a thread?", difficulty: "Easy" },
        { q: "How does Redis or Memcached improve application performance?", difficulty: "Medium" },
        { q: "Explain the concept of containerization using Docker.", difficulty: "Easy" },
        { q: "How would you design a URL shortener like bit.ly?", difficulty: "Hard" },
        { q: "What are microservices and how do they differ from monolithic architectures?", difficulty: "Medium" },
        { q: "Explain indexing in databases and how it impacts query speed.", difficulty: "Medium" },
        { q: "Describe the CAP theorem and its implications in distributed systems.", difficulty: "Hard" },
        { q: "What is event-driven architecture and when would you use it?", difficulty: "Hard" },
        { q: "Explain the difference between TCP and UDP protocols.", difficulty: "Easy" },
        { q: "How do you secure a REST API?", difficulty: "Medium" },
        { q: "What is horizontal vs vertical scaling?", difficulty: "Easy" }
    ],
    behavioral: [
        { q: "Tell me about a time you handled a difficult teammate.", difficulty: "Medium" },
        { q: "Describe a project that failed and what you learned from it.", difficulty: "Hard" },
        { q: "How do you prioritize your work when facing strict deadlines?", difficulty: "Easy" },
        { q: "Tell me about a time you had to learn quickly on the job.", difficulty: "Medium" },
        { q: "Describe a situation where you strongly disagreed with your manager.", difficulty: "Hard" },
        { q: "Tell me about a time you went above and beyond for a project.", difficulty: "Medium" },
        { q: "How do you handle receiving critical feedback?", difficulty: "Medium" },
        { q: "Give an example of a goal you reached and how you achieved it.", difficulty: "Easy" },
        { q: "Tell me about a time you demonstrated leadership without having the title.", difficulty: "Hard" },
        { q: "How do you keep your technical knowledge up to date?", difficulty: "Easy" }
    ],
    hr: [
        { q: "Why are you interested in this position?", difficulty: "Easy" },
        { q: "What are your greatest professional strengths?", difficulty: "Easy" },
        { q: "What do you consider to be your weaknesses?", difficulty: "Medium" },
        { q: "Where do you see yourself in five years?", difficulty: "Easy" },
        { q: "Why should we hire you over other candidates?", difficulty: "Medium" },
        { q: "Tell me about a time you had to adapt to a major change at work.", difficulty: "Medium" },
        { q: "What is your preferred work environment?", difficulty: "Easy" },
        { q: "How do you handle stress and pressure?", difficulty: "Medium" },
        { q: "What are your salary expectations?", difficulty: "Hard" },
        { q: "What is your proudest professional achievement?", difficulty: "Medium" }
    ],
    coding: [
        { q: "Optimize an algorithm to find duplicates in an array to O(n) time.", difficulty: "Medium" },
        { q: "How would you reverse a linked list iteratively and recursively?", difficulty: "Medium" },
        { q: "Explain the concept of Dynamic Programming with an example like Fibonacci.", difficulty: "Medium" },
        { q: "How would you find the lowest common ancestor of two nodes in a Binary Tree?", difficulty: "Hard" },
        { q: "Implement an LRU Cache. What data structures would you use?", difficulty: "Hard" },
        { q: "Explain how you would detect a cycle in a directed graph.", difficulty: "Medium" },
        { q: "How do you implement a binary search tree insertion?", difficulty: "Easy" },
        { q: "Describe an algorithm to merge two sorted arrays efficiently.", difficulty: "Easy" },
        { q: "How do you solve the Two Sum problem optimally?", difficulty: "Easy" },
        { q: "Explain A* search algorithm and its use cases.", difficulty: "Hard" }
    ]
};

export interface EvalResult {
    rating: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
}

export function evaluateAnswer(answer: string, category: string): EvalResult {
    const words = answer.split(/\s+/).length;

    if (words < 10) {
        return {
            rating: Math.floor(Math.random() * 3) + 3,
            feedback: "Your answer is quite brief. Interviews are opportunities to showcase your deep understanding.",
            strengths: ["Clear and direct."],
            weaknesses: ["Lacks detail and technical depth.", "Too short for a comprehensive evaluation."],
            improvements: ["Elaborate on your points using specific examples.", "Use the STAR method for behavioral answers."]
        };
    }

    let rating = Math.min(10, Math.max(5, Math.floor(words / 15) + 4));

    const strengths = ["Good articulation of your thoughts."];
    const weaknesses: string[] = [];
    const improvements: string[] = [];

    const lowerAns = answer.toLowerCase();

    if (category === "technical" || category === "coding") {
        if (/\b(because|time|space|complexity|o\(|scalable|memory)\b/.test(lowerAns)) {
            strengths.push("Mentions key technical considerations like scalability or complexity.");
            rating += 1;
        } else {
            weaknesses.push("Lacks discussion on trade-offs or efficiency.");
            improvements.push("Always discuss time and space complexity or system trade-offs.");
        }

        if (/\b(example|instance|project|used)\b/.test(lowerAns)) {
            strengths.push("Backs up theoretical knowledge with practical context.");
        } else {
            weaknesses.push("Very theoretical.");
            improvements.push("Try linking concepts to actual times you used them.");
        }
    } else if (category === "behavioral") {
        if (/\b(situation|task|action|result|i did|we did)\b/.test(lowerAns)) {
            strengths.push("Follows a structured storytelling approach.");
            rating += 1;
        } else {
            weaknesses.push("The story lacks clear structure.");
            improvements.push("Try using the STAR format (Situation, Task, Action, Result) to frame your response.");
        }

        if (/\b(learned|improved|resolved)\b/.test(lowerAns)) {
            strengths.push("Shows focus on outcomes and learning.");
        }
    } else if (category === "hr") {
        if (/\b(goal|vision|align|growth|passion)\b/.test(lowerAns)) {
            strengths.push("Demonstrates clear alignment with professional growth.");
            rating += 1;
        } else {
            weaknesses.push("Response feels a bit generic.");
            improvements.push("Tailor your answer more specifically to the company or role you envision.");
        }
    }

    if (words > 100) {
        weaknesses.push("Slightly verbose.");
        improvements.push("Try to make your answers more concise to keep the interviewer engaged.");
        rating = Math.min(10, rating - 1);
    }

    rating = Math.min(10, rating);

    const feedbackIntro = rating >= 7 ? "Good effort. " : "Needs some work. ";
    let feedbackText = feedbackIntro + "Your response covers the basics but could be refined.";
    if (weaknesses.length === 0) {
        feedbackText = "Excellent answer! You structured your response very well.";
    }

    return { rating, feedback: feedbackText, strengths, weaknesses, improvements };
}

export function generateFollowUp(answer: string, category: string): string {
    const templates = [
        "That's interesting. Can you elaborate on the most challenging part of that?",
        "Could you provide a specific example to illustrate your point?",
        "How would your approach change if the scale of the problem was 10x larger?",
        "What trade-offs did you consider when taking that approach?",
        "If you could do it again, what would you do differently?",
        "Why did you choose that specific solution over alternatives?"
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

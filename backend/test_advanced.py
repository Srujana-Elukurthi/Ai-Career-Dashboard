import requests
import json
from datetime import datetime, timezone, timedelta

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
    "variables": {"username": "albert"}
}

try:
    response = requests.post(url, json=payload, headers={'User-Agent': 'Mozilla/5.0'})
    response.raise_for_status()
    data = response.json()
    
    user_data = data["data"]["matchedUser"]
    
    # Topics
    topics = []
    tag_counts = user_data.get("tagProblemCounts", {})
    all_tags = (tag_counts.get("advanced") or []) + \
               (tag_counts.get("intermediate") or []) + \
               (tag_counts.get("fundamental") or [])
    
    for tag in all_tags:
        topics.append({"topic": tag["tagName"], "count": tag["problemsSolved"]})
    
    topics = sorted(topics, key=lambda x: x["count"], reverse=True)[:5]
    
    # Calendar
    cal_str = user_data.get("submissionCalendar", "{}")
    cal = json.loads(cal_str)
    
    # Convert timestamps to dates in UTC (LeetCode uses UTC for streaks)
    daily_counts = {}
    for ts_str, count in cal.items():
        dt = datetime.fromtimestamp(int(ts_str), tz=timezone.utc).date()
        daily_counts[dt] = daily_counts.get(dt, 0) + count
        
    dates = sorted(daily_counts.keys())
    
    # Streaks
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
                
        # current streak
        today = datetime.now(timezone.utc).date()
        if today in dates or (today - timedelta(days=1)) in dates:
            c_streak = 1
            idx = len(dates) - 1
            if dates[idx] == today or dates[idx] == today - timedelta(days=1):
                while idx > 0 and (dates[idx] - dates[idx-1]).days == 1:
                    c_streak += 1
                    idx -= 1
                current_streak = c_streak
        else:
            current_streak = 0
            
    # Recent activity
    today = datetime.now(timezone.utc).date()
    recent = []
    for i in range(7):
        d = today - timedelta(days=i)
        recent.append({
            "date": d.strftime("%Y-%m-%d"),
            "count": daily_counts.get(d, 0)
        })
        
    print(json.dumps({
        "topics": topics,
        "current_streak": current_streak,
        "max_streak": max_streak,
        "recent_activity": recent
    }, indent=2))
        
except Exception as e:
    print(e)

import requests
import time
import random

# Endpoints
LOGIN_URL = "https://localhost:5041/api/v1/auth/login"
CHAT_URL = "https://localhost:5041/api/v1/conversation/f0aa8865-412b-4456-871e-c66aeb43e880/chat"

# Disable SSL warnings for localhost self-signed certs
requests.packages.urllib3.disable_warnings()

# User credentials
users = [
    {"HandleOrEmail": "testuser", "Password": "hallo123"},
    {"HandleOrEmail": "testuser2", "Password": "hallo123"}
]

# Login helper
def login(user):
    session = requests.Session()
    resp = session.post(LOGIN_URL, json=user, verify=False)
    if resp.status_code != 200:
        print(f"Login failed for {user['HandleOrEmail']} ({resp.status_code})")
        print(resp.text)
        exit(1)
    print(f"Logged in as {user['HandleOrEmail']}")
    return session

sessions = [login(u) for u in users]

messages_user1 = [
    "Hey", "How are you?", "What's up?", "Cool", "Sure", "Lol", "Yeah", "Nope", "Exactly", "Alright",
    "Got it", "Nice", "I agree", "Same", "Okay", "Sweet", "Perfect", "Haha", "Hmm", "Right"
]
messages_user2 = [
    "Hey there", "Good, you?", "Not much", "Nice!", "Agreed", "haha", "True", "Yep", "Correct", "Exactly!",
    "Okay", "Sure thing", "Gotcha", "Cool stuff", "Sounds good", "Indeed", "Alrighty", "Yup", "Fair", "Word"
]

for i in range(100):
    sender_idx = i % 2
    session = sessions[sender_idx]
    message_pool = messages_user1 if sender_idx == 0 else messages_user2
    message = random.choice(message_pool)

    # Send as multipart/form-data
    files = {"message": (None, message)}

    resp = session.post(CHAT_URL, files=files, verify=False)
    if resp.status_code != 200:
        print(f"Message {i+1} failed ({resp.status_code}): {resp.text}")
    else:
        print(f"[User{sender_idx+1}] -> {message}")

    time.sleep(0.15)

print("Conversation seeding complete.")

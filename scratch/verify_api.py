import requests

url = "http://localhost:8000/interaction/"
payload = {
    "hcp_name": "Test HCP Automated",
    "interaction_type": "Call",
    "date": "2026-04-16",
    "attendees": ["Self", "Agent"],
    "topics_discussed": "Testing fix via script",
    "follow_up": "Check back later"
}

response = requests.post(url, json=payload)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 200:
    data = response.json()
    assert data["follow_up_actions"] == "Check back later"
    assert data["attendees"] == "Self, Agent"
    print("Verification Successful!")
else:
    print("Verification Failed!")

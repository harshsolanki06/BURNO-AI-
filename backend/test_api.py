"""Test all EchoVerse API endpoints."""
import httpx
import json

base = "http://localhost:8000"
results = []

def test(method, path, **kwargs):
    try:
        r = getattr(httpx, method)(f"{base}{path}", timeout=15, **kwargs)
        return r
    except Exception as e:
        print(f"  ERROR: {e}")
        return None

print("=" * 50)
print("EchoVerse AI OS — API Test Suite")
print("=" * 50)

# 1. Root
r = test("get", "/")
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] GET /")

# 2. Health
r = test("get", "/health")
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] GET /health")

# 3. Agents
r = test("get", "/api/agents")
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] GET /api/agents")
if r and r.status_code == 200:
    data = r.json()
    print(f"       {len(data['agents'])} agents available")

# 4. System status
r = test("get", "/api/system/status")
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] GET /api/system/status")

# 5. Chat
r = test("post", "/api/chat", json={"message": "write python code"})
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] POST /api/chat")
if r and r.status_code == 200:
    data = r.json()
    print(f"       Routed to: {data['agent_type']} ({data['processing_time_ms']}ms)")
elif r:
    print(f"       Error: {r.text[:200]}")

# 6. Auth register
r = test("post", "/api/auth/register", json={
    "name": "Test User",
    "email": "test@echoverse.ai",
    "password": "password123"
})
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] POST /api/auth/register")
token = None
if r and r.status_code == 200:
    token = r.json()["access_token"]
    print(f"       Token: {token[:30]}...")
elif r:
    print(f"       {r.status_code}: {r.text[:100]}")

# 7. Auth login
r = test("post", "/api/auth/login", json={
    "email": "test@echoverse.ai",
    "password": "password123"
})
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] POST /api/auth/login")

# 8. Auth me (protected)
if token:
    r = test("get", "/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] GET /api/auth/me")
    if r and r.status_code == 200:
        print(f"       User: {r.json()['name']} ({r.json()['email']})")

# 9. Create task
r = test("post", "/api/tasks", json={
    "title": "Research quantum computing",
    "description": "Find latest papers",
    "agent_type": "research"
})
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] POST /api/tasks")

# 10. List tasks
r = test("get", "/api/tasks")
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] GET /api/tasks")
if r and r.status_code == 200:
    print(f"       {r.json()['count']} tasks in DB")

# 11. Memory store
r = test("post", "/api/memory/store", json={
    "content": "User prefers dark theme",
    "category": "preference"
})
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] POST /api/memory/store")

# 12. Memory search
r = test("get", "/api/memory/search", params={"query": "dark"})
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] GET /api/memory/search")
if r and r.status_code == 200:
    print(f"       {r.json()['count']} results found")

# 13. Automation
r = test("post", "/api/automation/execute", json={
    "action": "open_browser",
    "target": "https://google.com"
})
print(f"[{'OK' if r and r.status_code == 200 else 'FAIL'}] POST /api/automation/execute")

print()
print("=" * 50)
print("Test complete!")
print("=" * 50)

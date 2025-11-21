# 📚 Bulk Subject Import - Alternative Methods

Since you have the subjects JSON data, here are **3 ways** to import them:

## Method 1: Direct Script Import (Easiest) ⭐

### Step 1: Save Your Subjects JSON

Create a file `subjects.json` in the `backend` folder with your subjects:

```json
[
  {
    "name": "Applied Mathematics I",
    "code": "AM101",
    "branch": "Computer Engineering",
    "semester": 1,
    "credits": 4,
    "hours": 60,
    "type": "Theory",
    "description": "Basic mathematics concepts"
  },
  {
    "name": "Applied Physics I",
    "code": "AP101",
    "branch": "Computer Engineering",
    "semester": 1,
    "credits": 4,
    "hours": 60,
    "type": "Theory",
    "description": "Basic physics concepts"
  }
]
```

### Step 2: Run the Import Script

```bash
cd backend
node import-subjects-bulk.js subjects.json
```

That's it! The script will:
- ✅ Validate all subjects
- ✅ Check for duplicates
- ✅ Import to Firebase
- ✅ Show you a summary

### Alternative: Pipe from stdin

```bash
cat subjects.json | node backend/import-subjects-bulk.js --stdin
```

---

## Method 2: Using the Web UI (If Firebase is Working)

1. Go to Admin Dashboard → Subjects
2. Click "Import K-Scheme"
3. Paste your JSON array
4. Click "Import Subjects"

---

## Method 3: Manual API Call (Using curl/Postman)

If you want to use the API directly:

```bash
# Get your admin token first (from browser DevTools → Application → Local Storage)
TOKEN="your-admin-token-here"

# Import subjects
curl -X POST http://localhost:5000/api/subjects/bulk-import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @subjects.json
```

---

## 📋 Subject JSON Format

Each subject must have:

**Required fields:**
- `name` - Subject name (string)
- `code` - Subject code (string, e.g., "AM101")
- `branch` - One of the 7 branches (exact match required)
- `semester` - Number between 1-6

**Optional fields:**
- `credits` - Number (default: 4)
- `hours` - Number (default: 60)
- `type` - "Theory", "Practical", "Project", or "Elective" (default: "Theory")
- `description` - String (default: "")

### Valid Branches:
1. Computer Engineering
2. Information Technology
3. Electronics & Telecommunication
4. Mechanical Engineering
5. Electrical Engineering
6. Civil Engineering
7. Instrumentation Engineering

---

## 🚀 Quick Start

**Just paste your JSON here and I'll help you format it, or:**

1. Save your subjects to `backend/subjects.json`
2. Run: `node backend/import-subjects-bulk.js subjects.json`
3. Done! ✅

---

## Example: Complete JSON for Computer Engineering Semester 1

```json
[
  {
    "name": "Applied Mathematics I",
    "code": "AM101",
    "branch": "Computer Engineering",
    "semester": 1,
    "credits": 4,
    "hours": 60,
    "type": "Theory",
    "description": "Differential calculus, integral calculus"
  },
  {
    "name": "Applied Physics I",
    "code": "AP101",
    "branch": "Computer Engineering",
    "semester": 1,
    "credits": 4,
    "hours": 60,
    "type": "Theory",
    "description": "Mechanics, waves, and oscillations"
  },
  {
    "name": "Programming in C",
    "code": "PC101",
    "branch": "Computer Engineering",
    "semester": 1,
    "credits": 3,
    "hours": 45,
    "type": "Practical",
    "description": "C programming fundamentals"
  }
]
```

---

## 💡 Tips

1. **Validate JSON first**: Use https://jsonlint.com/ to check your JSON
2. **Check for duplicates**: The script will skip subjects with existing codes
3. **Branch names must match exactly**: Copy-paste from the list above
4. **Semester must be 1-6**: Use numbers, not strings

---

## Need Help?

Just paste your subjects JSON here and I'll:
- ✅ Format it correctly
- ✅ Validate it
- ✅ Create the import file for you
- ✅ Help you run the import


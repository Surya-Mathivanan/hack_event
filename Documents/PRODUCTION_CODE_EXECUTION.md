# 🚀 Production Code Execution Solution

## 🎯 **The Problem**

Your current code execution runs directly on the server, which:
- ❌ Won't work on Vercel/Netlify (no Python/GCC)
- ❌ Is a security risk (arbitrary code execution)
- ❌ Can't scale (resource intensive)

## ✅ **The Solution: Use Judge0 API**

Judge0 is a secure, scalable code execution API used by major coding platforms.

---

## 📦 **Option 1: Judge0 API (Recommended)**

### **Step 1: Get API Key**

1. Go to: https://rapidapi.com/judge0-official/api/judge0-ce
2. Sign up for free
3. Subscribe to free plan (50 requests/day)
4. Copy your API key

### **Step 2: Install Dependencies**

```bash
npm install axios
```

### **Step 3: Update Code**

Create `server/judge0.ts`:

```typescript
import axios from 'axios';

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
const API_KEY = process.env.JUDGE0_API_KEY!;

interface ExecutionResult {
  output: string;
  error?: string;
  status: string;
}

const languageIds = {
  python: 71,  // Python 3
  c: 50,       // C (GCC 9.2.0)
  cpp: 54,     // C++ (GCC 9.2.0)
};

export async function executeCode(
  language: string,
  code: string,
  input: string
): Promise<ExecutionResult> {
  try {
    const languageId = languageIds[language as keyof typeof languageIds];
    
    if (!languageId) {
      return { output: '', error: 'Unsupported language', status: 'error' };
    }

    // Submit code
    const submitResponse = await axios.post(
      `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: languageId,
        stdin: input,
      },
      {
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
      }
    );

    const result = submitResponse.data;

    // Check status
    if (result.status.id === 3) {
      // Accepted
      return {
        output: result.stdout?.trim() || '',
        status: 'success',
      };
    } else if (result.status.id === 6) {
      // Compilation Error
      return {
        output: '',
        error: `Compilation Error:\n${result.compile_output}`,
        status: 'error',
      };
    } else if (result.status.id === 5) {
      // Time Limit Exceeded
      return {
        output: '',
        error: 'Time Limit Exceeded',
        status: 'error',
      };
    } else {
      // Runtime Error
      return {
        output: '',
        error: `Runtime Error:\n${result.stderr || result.message}`,
        status: 'error',
      };
    }
  } catch (error: any) {
    return {
      output: '',
      error: `Execution failed: ${error.message}`,
      status: 'error',
    };
  }
}
```

### **Step 4: Update routes.ts**

Replace the `executeCode` function in `server/routes.ts`:

```typescript
import { executeCode } from './judge0';

// Remove the old executeCode function
// Use the new one from judge0.ts
```

### **Step 5: Add to .env**

```env
JUDGE0_API_KEY=your-rapidapi-key-here
```

### **Step 6: Deploy**

Now you can deploy to Vercel/Netlify/Railway and code execution will work!

---

## 📦 **Option 2: Piston API (Free Alternative)**

### **Step 1: Create piston.ts**

```typescript
import axios from 'axios';

const PISTON_API = 'https://emkc.org/api/v2/piston';

export async function executeCode(
  language: string,
  code: string,
  input: string
) {
  try {
    const response = await axios.post(`${PISTON_API}/execute`, {
      language: language === 'cpp' ? 'c++' : language,
      version: '*',
      files: [
        {
          content: code,
        },
      ],
      stdin: input,
    });

    const result = response.data;

    if (result.run.code === 0) {
      return {
        output: result.run.stdout.trim(),
        status: 'success',
      };
    } else {
      return {
        output: '',
        error: result.run.stderr || result.compile?.stderr,
        status: 'error',
      };
    }
  } catch (error: any) {
    return {
      output: '',
      error: `Execution failed: ${error.message}`,
      status: 'error',
    };
  }
}
```

**Pros:**
- ✅ Completely free
- ✅ No API key needed
- ✅ Easy to use

**Cons:**
- ⚠️ Public instance may be slow
- ⚠️ No guaranteed uptime
- ⚠️ Rate limits

---

## 📦 **Option 3: Self-Host Judge0 (Advanced)**

If you want full control and unlimited usage:

### **Requirements:**
- VPS (DigitalOcean, AWS, etc.)
- Docker installed
- At least 2GB RAM

### **Setup:**

```bash
# Clone Judge0
git clone https://github.com/judge0/judge0.git
cd judge0

# Start with Docker Compose
docker-compose up -d

# Your Judge0 instance will be at:
# http://your-vps-ip:2358
```

Then use your own Judge0 instance instead of RapidAPI.

---

## 📦 **Option 4: Serverless Functions (Complex)**

Use AWS Lambda or Google Cloud Functions to run code in isolated containers.

**Pros:**
- ✅ Full control
- ✅ Scales automatically
- ✅ Pay per use

**Cons:**
- ❌ Complex setup
- ❌ Requires Docker knowledge
- ❌ More expensive

---

## 🎯 **Recommended Approach**

### **For Development/Testing:**
✅ **Use Piston API** (free, no setup)

### **For Production:**
✅ **Use Judge0 API** ($10/month for 2000 submissions)

### **For High Traffic:**
✅ **Self-host Judge0** on VPS ($5-10/month)

---

## 📝 **Migration Steps**

1. **Choose a solution** (I recommend Judge0 for production)
2. **Get API key** (if using Judge0)
3. **Install axios**: `npm install axios`
4. **Create judge0.ts** (code provided above)
5. **Update routes.ts** to use new executeCode
6. **Add API key to .env**
7. **Test locally**
8. **Deploy to Vercel/Netlify**

---

## 💰 **Cost Comparison**

| Solution | Free Tier | Paid Plan | Best For |
|----------|-----------|-----------|----------|
| **Piston** | Unlimited | N/A | Development, small projects |
| **Judge0** | 50/day | $10/month (2000) | Production, reliable service |
| **Self-hosted** | N/A | $5-10/month VPS | High traffic, full control |
| **Sphere Engine** | 10/day | $99/month | Enterprise |

---

## ✅ **What to Do Now**

1. **For Local Development:**
   - Install Python/GCC (as per FIX_CODE_EXECUTION.md)
   - Keep using current code execution

2. **For Production Hosting:**
   - Sign up for Judge0 API (free tier)
   - Implement the Judge0 integration (code above)
   - Test it works
   - Deploy to Vercel/Netlify

---

## 🚀 **Quick Start with Judge0**

```bash
# 1. Install axios
npm install axios

# 2. Create judge0.ts file (copy code from above)

# 3. Get API key from RapidAPI

# 4. Add to .env
echo "JUDGE0_API_KEY=your-key-here" >> .env

# 5. Update routes.ts to import from judge0.ts

# 6. Test locally
npm run dev

# 7. Deploy
vercel deploy
```

---

**Last Updated:** February 9, 2026  
**Status:** 📚 Production Deployment Guide

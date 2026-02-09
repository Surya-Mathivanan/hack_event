# 🔧 Fix Code Execution Errors

## ❌ **The Errors**

When trying to run/test code, you're getting:

**Python:**
```
Python was not found; run without arguments to install from the Microsoft Store
```

**C/C++:**
```
'gcc' is not recognized as an internal or external command
```

## 🎯 **The Problem**

The code execution feature requires these compilers to be installed on your system:
- **Python** (for Python code)
- **GCC** (for C code)
- **G++** (for C++ code)

## ✅ **Solution: Install the Compilers**

### **Option 1: Install Python (EASIEST)**

#### **Method A: Using Microsoft Store (Recommended)**

1. **Open Microsoft Store**
   - Press `Windows + S`
   - Type "Microsoft Store"
   - Open it

2. **Search for Python**
   - Search "Python 3.12" or "Python 3.11"
   - Click on "Python 3.12" (or latest version)

3. **Install**
   - Click "Get" or "Install"
   - Wait for installation to complete

4. **Verify Installation**
   ```powershell
   python --version
   ```
   Should show: `Python 3.12.x`

#### **Method B: Using Official Installer**

1. **Download Python**
   - Go to: https://www.python.org/downloads/
   - Click "Download Python 3.12.x"

2. **Install**
   - Run the installer
   - ✅ **IMPORTANT:** Check "Add Python to PATH"
   - Click "Install Now"

3. **Verify**
   ```powershell
   python --version
   ```

---

### **Option 2: Install GCC/G++ for C/C++**

#### **Method A: Using MinGW-w64 (Recommended)**

1. **Download MSYS2**
   - Go to: https://www.msys2.org/
   - Download the installer
   - Run it and follow the installation wizard

2. **Install GCC/G++**
   - Open "MSYS2 MSYS" from Start Menu
   - Run these commands:
   ```bash
   pacman -Syu
   pacman -S mingw-w64-x86_64-gcc
   ```

3. **Add to PATH**
   - Add this to your system PATH:
   ```
   C:\msys64\mingw64\bin
   ```

4. **Verify**
   ```powershell
   gcc --version
   g++ --version
   ```

#### **Method B: Using Chocolatey (If you have it)**

```powershell
choco install mingw
```

---

### **Option 3: Install All at Once (Advanced)**

If you want to install everything quickly:

1. **Install Chocolatey** (if not installed)
   - Open PowerShell as Administrator
   - Run:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Install Python and MinGW**
   ```powershell
   choco install python mingw -y
   ```

3. **Restart Terminal**
   - Close and reopen your terminal
   - Verify:
   ```powershell
   python --version
   gcc --version
   g++ --version
   ```

---

## 🧪 **After Installation**

### **Step 1: Verify Installation**

Open a **NEW** PowerShell window and run:

```powershell
# Check Python
python --version
# Should show: Python 3.12.x

# Check GCC (for C)
gcc --version
# Should show: gcc version x.x.x

# Check G++ (for C++)
g++ --version
# Should show: g++ version x.x.x
```

### **Step 2: Restart the Server**

1. **Stop the server**
   - Press `Ctrl+C` in the terminal where `npm run dev` is running

2. **Start it again**
   ```powershell
   npm run dev
   ```

### **Step 3: Test Code Execution**

1. Go to http://localhost:3000
2. Open a problem
3. Write some code (Python, C, or C++)
4. Click "Run" or "Test"
5. ✅ Should work now!

---

## 📝 **Quick Installation Guide**

### **For Python Only (Fastest)**

```powershell
# Open PowerShell and run:
winget install Python.Python.3.12

# Or use Microsoft Store:
# Windows + S → Search "Python 3.12" → Install
```

### **For C/C++ Only**

```powershell
# Using Chocolatey:
choco install mingw -y

# Or download MSYS2 from: https://www.msys2.org/
```

### **For Everything**

```powershell
# Using Chocolatey (run as Administrator):
choco install python mingw -y
```

---

## 🔍 **Troubleshooting**

### **Issue: "python" command not found after installation**

**Solution:**
1. Close ALL terminal windows
2. Open a NEW PowerShell window
3. Try `python --version` again

### **Issue: Still says "Python was not found"**

**Solution:**
1. Check if Python is in PATH:
   ```powershell
   $env:Path -split ';' | Select-String python
   ```

2. If not found, add manually:
   - Search "Environment Variables" in Windows
   - Edit "Path" variable
   - Add: `C:\Users\YourName\AppData\Local\Programs\Python\Python312`
   - Add: `C:\Users\YourName\AppData\Local\Programs\Python\Python312\Scripts`

### **Issue: GCC not found after installation**

**Solution:**
1. Add MinGW to PATH:
   - Add: `C:\msys64\mingw64\bin`
   - Or: `C:\ProgramData\chocolatey\lib\mingw\tools\install\mingw64\bin`

2. Restart terminal

---

## ✅ **Verification Checklist**

After installation:

- [ ] Python installed (`python --version` works)
- [ ] GCC installed (`gcc --version` works)
- [ ] G++ installed (`g++ --version` works)
- [ ] Server restarted
- [ ] Code execution tested
- [ ] All test cases pass

---

## 🎯 **Expected Result**

After installing the compilers, when you run code, you should see:

```
POST /api/run 200 in 150ms :: {
  "status": "success",
  "results": [
    {
      "passed": true,
      "input": "2 7 11 15\n9",
      "expectedOutput": "0 1",
      "actualOutput": "0 1",
      "isHidden": false
    }
  ]
}
```

Instead of:
```
"error": "Python was not found..."
```

---

## 📌 **Summary**

**What to Install:**
1. **Python 3.12** - For Python code execution
2. **GCC/G++** (MinGW) - For C/C++ code execution

**How to Install:**
- **Easiest:** Microsoft Store (Python) + MSYS2 (GCC)
- **Fastest:** Chocolatey package manager

**After Installation:**
- Restart terminal
- Restart server (`npm run dev`)
- Test code execution

---

**Last Updated:** February 9, 2026  
**Status:** ⚠️ Requires Compiler Installation

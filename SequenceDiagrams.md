# Sequence Diagrams

This document contains the Sequence Diagrams for the Food Additives Scanning App, based on the provided Activity Diagrams and the codebase implementation.

## 1. Login Workflow

**Description:**
The user enters their credentials. The system first validates if fields are empty. If valid, it sends a request to the server. The server verifies the user against the database. On success, a token is returned and saved locally.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant DB as Database

    User->>App: Enter Login & Password
    User->>App: Click 'Login' Button
    
    alt Fields Empty
        App-->>User: Alert: "Fill all fields"
    else Fields Valid
        App->>Server: POST /api/login
        Server->>DB: Find User (email/username)
        DB-->>Server: Return User Data
        
        alt User Not Found or Invalid Password
            Server-->>App: 400 Bad Request
            App-->>User: Alert: "Login Failed"
        else Credentials Valid
            Server->>Server: Generate JWT Token
            Server-->>App: 200 OK (Token + User Data)
            App->>App: Save Token & User Data (AsyncStorage)
            App->>App: Update AuthContext
            App-->>User: Navigate to Main Tabs
        end
    end
```

## 2. Register Workflow

**Description:**
The user enters registration details. The system checks if passwords match. If they do, the data is sent to the server. The server checks for existing users before creating a new account.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant DB as Database

    User->>App: Enter Details (Email, User, Pass, Health)
    User->>App: Click 'Register' Button

    alt Passwords Do Not Match
        App-->>User: Alert: "Passwords do not match"
    else Passwords Match
        App->>Server: POST /api/register
        Server->>DB: Check if User exists
        
        alt User Exists
            DB-->>Server: User Found
            Server-->>App: 400 Bad Request
            App-->>User: Alert: Error Message
        else New User
            Server->>DB: Create New User
            DB-->>Server: Success
            Server-->>App: 201 Created
            App-->>User: Alert: "Account Created"
            App-->>User: Navigate to Login
        end
    end
```

## 3. Scan Workflow (Barcode & OCR)

**Description:**
The user selects a mode. The app checks the scan quota for non-VIP users. In **OCR Mode**, an image is analyzed by Poe AI, then the user edits the text. In **Barcode Mode**, the product is fetched from the `FoodLabelBarCodeScan` DB. It cross-checks user allergies/diet, logs the scan to `ScanHistory`, and uses a quota.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant DB as Database
    participant AI as Poe AI Service

    User->>App: Select Mode (Barcode or OCR)
    
    App->>Server: GET /api/GetScanQuota
    Server-->>App: Quota Data
    
    alt Quota Exceeded & Not VIP
        App-->>User: Alert: "Scan Quota Exceeded. Upgrade to VIP."
    else Quota Available or is VIP
        alt OCR Mode
            User->>App: Take Photo of Label
            App->>AI: Call Poe AI API: Extract Text
            AI-->>App: Return Extracted Text
            App->>App: Navigate to Edit Page
        else Barcode Mode
            User->>App: Scan Barcode
            App->>Server: GET /api/GetProduct?barcode=...
            Server->>DB: Query 'FoodLabelBarCodeScan'
            
            alt Product Found
                DB-->>Server: Product Data
                Server-->>App: Return Data
                App->>App: Navigate to Product Details
            else Not Found
                DB-->>Server: Null
                Server-->>App: 404 Not Found
                App-->>User: Alert: "Not found"
                App->>App: Navigate to Edit Page
            end
        end

        opt If on Edit Page (OCR or Manual Entry)
            User->>App: Input Name & Verify Text
            User->>App: Click 'Save & View'
        end

        Note over App, User: View Product Details & Process Analysis
        
        App->>App: Check Analysis (Cross-check allergies/diet)
        App->>App: Display Analysis Report
        
        App->>Server: POST /api/SaveScanHistory
        Server->>DB: Save to 'ScanHistory'
        DB-->>Server: Success
        Server-->>App: 201 Created
        
        App->>Server: POST /api/UseScanQuota
        Server->>DB: Update User Quota
        Server-->>App: 200 OK
    end
```

## 4. Forgot Password Workflow

**Description:**
The user requests a password reset. An OTP is sent and stored in the database (`resetOTP`). The user verifies the OTP and sets a new password.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant DB as Database

    User->>App: Enter Registered Email
    User->>App: Click 'Send Reset OTP'

    App->>Server: POST /api/forgot-password
    Server->>DB: Find User by Email
    
    alt User Not Found
        DB-->>Server: Null
        Server-->>App: 404 Not Found
        App-->>User: Alert: "User not found"
    else User Found
        Server->>DB: Save resetOTP to User
        Server-->>App: 200 OK (OTP Sent via Email)
        App-->>User: Navigate to OTP Verification
        
        User->>App: Enter OTP
        App->>Server: POST /api/verify-otp
        Server->>DB: Check resetOTP
        
        alt Invalid OTP
            Server-->>App: 400 Bad Request
            App-->>User: Alert: "Invalid OTP"
        else Valid OTP
            Server-->>App: 200 OK
            App-->>User: Navigate to New Password Screen
            
            User->>App: Enter New Password
            App->>Server: POST /api/reset-password-final
            Server->>DB: Update Password & Clear OTP
            Server-->>App: 200 OK
            App-->>User: Alert: "Password reset successful"
            App-->>User: Navigate to Login
        end
    end
```

## 5. Logout Workflow

**Description:**
The user initiates logout from the profile tab. The application clears the local user state (Context) and removes the persistent authentication token from storage.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Storage as AsyncStorage

    User->>App: Open Profile Tab
    User->>App: Click 'Logout' Button
    App->>App: Clear User State (Context)
    App->>Storage: Remove 'userToken' & 'userData'
    App-->>User: Navigate to Login Screen
```

## 6. History Workflow

**Description:**
The user views their past scans. The app loads this data from local storage. The user can view details or delete items.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant DB as Database

    User->>App: Open History Tab
    App->>App: Load History from Context/Storage
    App-->>User: Display History List

    alt View Item
        User->>App: Click 'View' Button
        App-->>User: Navigate to Product Details
    else Delete Item
        User->>App: Click Delete Icon
        User->>App: Confirm Deletion
        App->>Server: DELETE /api/DeleteScanHistory
        Server->>DB: Remove Item
        DB-->>Server: Success
        Server-->>App: 200 OK
        App->>App: Remove from Context/Storage
        App-->>User: Update Displayed List
    end
```

## 7. Blog Workflow

**Description:**
Users can browse community posts, create their own posts, and engage by commenting, liking, and saving favorites.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant DB as Database

    User->>App: Open Blog Tab
    App->>Server: GET /api/blogs
    Server->>DB: Fetch All Blogs
    DB-->>Server: Blog List
    Server-->>App: Return Blogs
    App-->>User: Display Posts

    alt Create Post
        User->>App: Click '+' (Create)
        User->>App: Enter Title & Content
        User->>App: Click 'Submit'
        App->>Server: POST /api/blogs
        Server->>DB: Insert New Blog
        DB-->>Server: Success
        Server-->>App: 201 Created
        App-->>User: Navigate to Feed (Refresh)
    else View & Interact
        User->>App: Click to View Post (GET /api/blogs/:id)
        App->>Server: GET /api/blog-comments/:id
        Server-->>App: Return Comments
        
        par User Interactions
            opt Add Comment
                User->>App: Enter Comment Text
                User->>App: Click 'Send'
                App->>Server: POST /api/blog-comments
                Server->>DB: Save in 'Blog_comments'
                Server-->>App: Success
                App-->>User: Refresh Comment List
            end
            opt Like/Dislike
                User->>App: Click Like
                App->>Server: POST /api/blog-likes
                Server->>DB: Add to 'Blog_likes'
                Server-->>App: Success
            end
            opt Favorite
                User->>App: Click Bookmark
                App->>Server: POST /api/favorites
                Server->>DB: Add to 'Favorites'
                Server-->>App: Success
            end
        end
    end
```

## 8. News Workflow

**Description:**
Users read food safety alerts scraped from data.gov.hk. The frontend reads from the local `alerts.json` file, and users can leave comments tied to specific alerts.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant LocalFile as alerts.json
    participant DB as Database

    User->>App: Open Home/News Tab (AlertContext)
    App->>Server: GET /api/alerts
    Server->>LocalFile: fs.readFileSync('alerts.json')
    LocalFile-->>Server: Return Alert Array
    Server-->>App: Return Headlines Data
    App-->>User: Display Alerts List

    User->>App: Click Alert Headline
    App-->>User: Navigate to news-details.jsx
    App->>Server: GET /api/GetComments?newsId=...
    Server->>DB: Query 'Comments' Collection
    DB-->>Server: Returning specific alert comments
    Server-->>App: Return Comments
    
    User->>App: Read Advisory
    
    opt Add Comment
        User->>App: Enter Comment
        User->>App: Click 'Send'
        App->>Server: POST /api/SaveComment
        Server->>DB: Insert into 'Comments'
        Server-->>App: Success
        App-->>User: Refresh Comment List
    end
```

## 9. Profile Management Workflow

**Description:**
Users can update their personal information. Changes are sent to the server and the local user context is updated.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant DB as Database

    User->>App: Open Profile Tab
    App->>App: Display User Info (from Context)
    
    User->>App: Click 'Settings' button
    User->>App: Update Info (Allergies/Diet/Name)
    User->>App: Click 'Save Changes'
    
    App->>Server: PUT /api/user/update
    Server->>DB: Update User Document
    
    alt Update Successful
        DB-->>Server: Success
        Server-->>App: 200 OK (Updated User Data)
        App->>App: Update Local Context
        App-->>User: Alert: "Profile Updated"
    else Update Failed
        Server-->>App: Error
        App-->>User: Alert: "Update Failed"
    end
```

## 10. VIP Upgrade Workflow

**Description:**
Users can subscribe to a VIP plan. The app interfaces with an external payment flow to process the transaction. Once the payment is verified, the user's status is upgraded in the database.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Payment as Payment Gateway
    participant Server as Backend API
    participant DB as Database

    User->>App: Open Upgrade Screen
    User->>App: Select Plan (Monthly/Yearly)
    User->>App: Click 'Pay Now'
    
    App->>Payment: Initiate Payment Request
    User->>Payment: Complete External Payment
    Payment-->>App: Payment Success Confirmation
    
    App->>User: Show Confirmation Dialog
    User->>App: Confirm Payment in App
    
    App->>Server: PUT /api/user/update { isVip: true }
    Server->>DB: db.users.updateOne(Set isVip=true)
    DB-->>Server: Success
    Server-->>App: 200 OK
    
    App->>App: Update AuthContext (isVip=true)
    App-->>User: Alert: "VIP Activated"
    App-->>User: Navigate to Profile
```

## 11. VIP Features Workflow

**Description:**
VIP users access exclusive features. The system checks VIP status before granting access.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant AI as AI Service

    User->>App: Open VIP Dashboard
    App->>App: Check isVip Status

    alt User is NOT VIP
        App-->>User: Redirect to Upgrade Screen
    else User is VIP
        User->>App: Select Feature (Recipes/Calories/Analysis)
        
        par Fetch Data
            App->>Server: Fetch Calorie Data
            App->>AI: Request Personalized Recipes
            App->>AI: Request Advanced Insights
        end
        
        Server-->>App: Return Data
        AI-->>App: Return AI Content
        
        App-->>User: Display Dashboard/Reports
    end
```

## 12. Discount Game Workflow

**Description:**
A gamified feature where users answer dynamically generated trivia questions focused on food safety or additives to win coupons. The system uses an AI service to dynamically generate the quiz questions.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant AI as AI Service (Poe API)
    participant DB as Database

    User->>App: Open Quiz Game
    App->>Server: GET /api/quiz/questions
    Server->>AI: Prompt AI to generate food safety questions
    AI-->>Server: Return dynamically generated questions
    Server-->>App: Return Questions
    
    loop For Each Question
        App-->>User: Display Question
        User->>App: Select Answer
        App->>App: Check Correctness & Increment Score
    end
    
    App-->>User: Show Game Over & Final Score
    
    alt Score High Enough (Win)
        App->>App: Generate Coupon Code
        App->>Server: POST /api/user/coupon
        Server->>DB: db.users.updateOne(Add Coupon to User)
        DB-->>Server: Success
        Server-->>App: 200 OK
        App->>App: Update User Context (Add Coupon)
        App-->>User: View Final Score & Coupon
    else Score Low
        App-->>User: View Final Score (No Coupon)
    end
```

## 13. Backend Scraper & Alert Update Workflow

**Description:**
A scheduled automated process where the Node.js backend fetches the latest food safety alerts from the external government API (data.gov.hk / CFS), parses the data, and caches it locally to `alerts.json` to prevent database read overload.

```mermaid
sequenceDiagram
    participant Cron as Scheduled Job (initDatabase / Cron)
    participant Server as Backend API (scraper.js)
    participant External as External CFS RSS / CKAN API
    participant LocalFile as alerts.json

    Cron->>Server: Trigger Update Alerts Job
    Server->>External: GET Latest RSS/XML Feeds
    External-->>Server: Return XML Source Data
    
    Server->>Server: Parse XML & Deduplicate (rssParser.js)
    Server->>Server: Format & Translate Text
    
    Server->>LocalFile: fs.writeFileSync('alerts.json')
    LocalFile-->>Server: File Write Success
    Server-->>Cron: Job Completed Successfully
```

## 14. Multilingual Toggle Workflow

**Description:**
The user switches the interface language (e.g., English to Traditional Chinese). The application updates the global state via `LanguageContext`, prompting all dependent react components to logically re-render in the selected language.

```mermaid
sequenceDiagram
    actor User
    participant Button as TranslateButton Component
    participant Context as LanguageContext
    participant App as Mobile App UI View

    User->>Button: Click 'Translate' Button
    Button->>Context: switchLanguage(newLangCode)
    Context->>Context: Update 'currentLanguage' Global State
    Context-->>App: Trigger Context Provider Re-render
    App->>App: Fetch static UI Strings for newLangCode
    App-->>User: Interface switches to selected language
```

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
The user selects a mode. In **OCR Mode**, an image is analyzed by AI, then the user edits/verifies the text. In **Barcode Mode**, the product is fetched from the server; if not found, the user is redirected to the edit page to manually enter details. Both paths lead to saving the scan history and displaying product details with health analysis.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant DB as Database
    participant AI as AI Service (OCR/Analysis)

    User->>App: Select Mode (Barcode or OCR)

    alt OCR Mode
        User->>App: Take Photo of Label
        App->>AI: Call AI: Extract Text
        AI-->>App: Return Extracted Text
        App->>App: Navigate to Edit Page
    else Barcode Mode
        User->>App: Scan Barcode
        App->>Server: GET /api/GetProduct?barcode=...
        Server->>DB: Query Product Collection
        
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
        App->>Server: POST /api/SaveScanHistory
        Server->>DB: Save to ScanHistory
        DB-->>Server: Success
        Server-->>App: 201 Created
        App->>App: Navigate to Product Details
    end

    Note over App, User: View Product Details & Wait for Analysis

    App->>App: Check if Analysis Exists?
    
    alt Analysis Does Not Exist
        App->>AI: Call AI: Analyze Health (Ingredients vs Allergies)
        AI-->>App: Analysis Report
        App->>App: Display Analysis Report
        App->>Server: Update DB with Analysis
    else Analysis Exists
        App->>App: Display Analysis Report
    end
```

## 4. Forgot Password Workflow

**Description:**
The user requests a password reset by providing their email. The server checks if the email exists in the database. If found, it simulates sending a reset link.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant DB as Database

    User->>App: Enter Registered Email
    User->>App: Click 'Send Reset Link'

    alt Email Empty
        App-->>User: Alert: "Please enter email"
    else Email Provided
        App->>Server: POST /api/reset-password
        Server->>DB: Find User by Email
        
        alt User Not Found
            DB-->>Server: Null
            Server-->>App: 404 Not Found
            App-->>User: Alert: "User not found"
        else User Found
            DB-->>Server: User Data
            Server-->>App: 200 OK (Link Sent)
            App-->>User: Alert: "Reset link sent"
            App-->>User: Navigate Back to Login
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
Users can browse community posts, create their own posts, and comment on existing ones.

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
    else View & Comment
        User->>App: Click to View Post
        App->>Server: GET /api/blog-comments/:id
        Server-->>App: Return Comments
        
        opt Add Comment
            User->>App: Enter Comment Text
            User->>App: Click 'Send'
            App->>Server: POST /api/blog-comments
            Server->>DB: Save Comment
            Server-->>App: Success
            App-->>User: Refresh Comment List
        end
    end
```

## 8. News Workflow

**Description:**
Users read news articles and discuss them. The app fetches headlines and manages a separate comment system for news.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant DB as Database

    User->>App: Open Home/News Tab
    App->>Server: Fetch News List (Internal/External)
    Server-->>App: Return Headlines
    App-->>User: Display Headlines

    User->>App: Click News Headline
    App-->>User: Navigate to Details
    App->>Server: GET /api/GetComments?newsId=...
    Server-->>App: Return Comments
    
    User->>App: Read Article
    
    opt Add Comment
        User->>App: Enter Comment
        User->>App: Click 'Send'
        App->>Server: POST /api/SaveComment
        Server->>DB: Save News Comment
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
Users can subscribe to a VIP plan. The app interfaces with an external payment flow.

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
    
    App->>Payment: Initiate Payment
    User->>Payment: Complete External Payment
    Payment-->>App: Payment Success
    
    App->>User: Show Confirmation Dialog
    User->>App: Confirm Payment in App
    
    App->>Server: PUT /api/user/update (isVip=true)
    Server->>DB: Update User Status
    DB-->>Server: Success
    Server-->>App: 200 OK
    
    App->>App: Update User Context (isVip=true)
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
A gamified feature where users answer trivia questions to win coupons.

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant Server as Backend API
    participant DB as Database

    User->>App: Open Quiz Game
    App->>Server: GET /api/quiz/questions
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
        Server->>DB: Add Coupon to User
        DB-->>Server: Success
        Server-->>App: 200 OK
        App->>App: Update User Context (Add Coupon)
        App-->>User: View Final Score & Coupon
    else Score Low
        App-->>User: View Final Score (No Coupon)
    end
    
    User->>App: Check Coupon Wallet
```

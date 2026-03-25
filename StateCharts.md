# System State Charts

This document contains the State Machine Diagrams (State Charts) for the Food Additives Scanning App. State charts illustrate the different states an entity or component can reside in during its lifecycle and the triggers that cause state transitions. This is a critical component of the System Design phase.

---

## 1. User Authentication & Session State

**Description:**
This state chart defines the lifecycle of a user's session within the application. It highlights the transition from a guest (Logged Out) to an authenticated user, distinguishing between standard Free users and VIP users. It also models the state change when a user upgrades via the payment gateway or when their session terminates.

```mermaid
stateDiagram-v2
    [*] --> LoggedOut
    
    LoggedOut --> Authenticating : User inputs credentials 
    Authenticating --> LoggedOut : Authentication Failed
    Authenticating --> AuthSession : Login Success
    
    state "Authenticated Session" as AuthSession {
        [*] --> Checking_Status
        Checking_Status --> LoggedIn_Free : isVip = false
        Checking_Status --> LoggedIn_VIP : isVip = true
        
        LoggedIn_Free --> VIP_Checkout : Clicks Upgrade
        VIP_Checkout --> VIP_Processing : Submits Payment Info
        VIP_Checkout --> LoggedIn_Free : Cancels Checkout
        
        VIP_Processing --> VIP_Payment_Failed : Payment Declined
        VIP_Payment_Failed --> VIP_Checkout : Retry Payment
        VIP_Payment_Failed --> LoggedIn_Free : Return to Dashboard
        
        VIP_Processing --> LoggedIn_VIP : Payment Success
        
        LoggedIn_VIP --> LoggedIn_Free : Subscription Expires / Cancelled
    }
    
    AuthSession --> LoggedOut : User Click Logout / Token Expires
    LoggedOut --> [*]
```

---

## 2. Blog Post Lifecycle State

**Description:**
This diagram shows the states a Community Blog Post goes through within the system—from draft creation to publication, and how it handles user interactions like comments, likes, and favorites.

```mermaid
stateDiagram-v2
    [*] --> Draft
    
    Draft --> Published : HTTP POST /api/blogs
    
    state Published {
        [*] --> Viewing
        Viewing --> Liked : User Clicks Like
        Liked --> Viewing : User Removes Like
        
        Viewing --> Favorited : User Bookmarks
        Favorited --> Viewing : User Removes Bookmark
        
        Viewing --> Comment_Added : User Posts Sub-Comment
        Comment_Added --> Viewing : Comment Saved
    }
    
    Published --> [*] : Remains in Community
```

---

## 3. Food Safety Alert Data State (Backend)

**Description:**
This state chart visualizes the backend automated scraping cycle. Since the alerts are updated via an async cron job rather than user interaction, this strictly models server-side states.

```mermaid
stateDiagram-v2
    [*] --> Standby
    
    Standby --> Fetching_Data : Cron triggers at 3:00 AM
    Fetching_Data --> Parsing_XML : CFS RSS Feed Downloaded
    Parsing_XML --> Deduplicating_Alerts : Identify New Alerts
    
    Deduplicating_Alerts --> Standby : No New Alerts
    Deduplicating_Alerts --> Writing_Local_Cache : New Alerts Found
    
    Writing_Local_Cache --> Cached_Available : alerts.json Updated
    Cached_Available --> Standby : Wait for Next Cycle
```

---

## 4. AI Quiz Game & Mock Coupon State

**Description:**
This models the state of the user's interactive AI quiz session and the subsequent awarding of a mock coupon. The coupon is awarded for gamification purposes and saved to the user's profile, though it is not redeemable for real transactions within the app.

```mermaid
stateDiagram-v2
    [*] --> Quiz_Not_Started
    
    Quiz_Not_Started --> Generating_Questions : User Initiates Game
    Generating_Questions --> Playing_Quiz : AI API Returns Questions
    Generating_Questions --> Quiz_Error : API Failure
    
    Quiz_Error --> Quiz_Not_Started : Retry
    
    Playing_Quiz --> Evaluating_Score : Answers Submitted
    
    Evaluating_Score --> Failed : Score too low
    Evaluating_Score --> Won_Coupon : Score meets threshold
    
    Failed --> Quiz_Not_Started : Retry
    
    Won_Coupon --> Saved_To_Account : Insert to User Profile
    
    Saved_To_Account --> [*] : Remains as Mock Reward
```


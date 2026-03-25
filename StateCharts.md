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
    Authenticating --> LoggedIn_Free : Success (isVip = false)
    Authenticating --> LoggedIn_VIP : Success (isVip = true)
    
    state "Authenticated Session" as AuthSession {
        LoggedIn_Free --> VIP_Processing : Initiates Subscription
        VIP_Processing --> VIP_Payment_Failed : Payment Declined
        VIP_Payment_Failed --> LoggedIn_Free : Return to Dashboard
        VIP_Processing --> LoggedIn_VIP : Payment Success
        LoggedIn_VIP --> LoggedIn_Free : Subscription Expires
    }
    
    AuthSession --> LoggedOut : User Click Logout / Token Expires
    LoggedOut --> [*]
```

---

## 2. Product Scanning & Analysis Lifecycle State

**Description:**
This diagram maps the state of the core scanning mechanism. It handles both Barcode and OCR modes. The states tracking how the system transitions from camera capture, to data extraction, database fetching, user editing, AI analysis cross-referencing user allergies, and finally logging to history.

```mermaid
stateDiagram-v2
    [*] --> Idle_Scanner
    
    Idle_Scanner --> Camera_Active : Open Scan Tab
    
    Camera_Active --> Processing_Barcode : Scan Barcode
    Camera_Active --> Processing_OCR : Capture Ingredient Label
    
    Processing_Barcode --> Fetching_DB : Query FoodLabelBarCodeScan
    Fetching_DB --> Product_Found : Barcode Exists
    Fetching_DB --> Product_Not_Found : Barcode Not in DB
    
    Processing_OCR --> Analyzing_AI : Call Poe AI OCR
    Analyzing_AI --> Manual_Entry : Text Extracted
    
    Product_Not_Found --> Manual_Entry : Redirect to Add Product
    
    Manual_Entry --> Health_Analysis : User Edits & Submits
    Product_Found --> Health_Analysis : Read Data & Proceed
    
    state "Analysis Engine" as AnalysisEngine {
        Health_Analysis --> Cross_Checking : Check Context (Allergies/Diet)
        Cross_Checking --> Displaying_Results : Generate Warnings
    }
    
    Displaying_Results --> Saving_History : POST /api/SaveScanHistory
    Saving_History --> [*] : Transaction Complete
```

---

## 3. Blog Post Lifecycle State

**Description:**
This diagram shows the states a Community Blog Post goes through within the system—from draft creation to publication, and how it handles user interactions like comments, likes, and favorites before potential deletion.

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
    
    Published --> Deleted : Author Triggers Delete
    Deleted --> [*]
```

---

## 4. Food Safety Alert Data State (Backend)

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

## 5. Discount Quiz & Coupon Gamification State

**Description:**
This models the state of the user's interactive discount quiz, their resulting win/loss condition, and the subsequent lifecycle of the awarded coupon until it is consumed during a VIP upgrade.

```mermaid
stateDiagram-v2
    [*] --> Quiz_Not_Started
    
    Quiz_Not_Started --> Playing_Quiz : User Initiates Game
    Playing_Quiz --> Evaluating_Score : Answers Submitted
    
    Evaluating_Score --> Failed : Score too low
    Evaluating_Score --> Won_Coupon : Score meets threshold
    
    Failed --> Quiz_Not_Started : Retry
    
    Won_Coupon --> Active_Coupon : Insert to User Profile
    
    Active_Coupon --> Pending_Redemption : User Enters VIP Checkout
    Pending_Redemption --> Active_Coupon : Checkout Cancelled
    Pending_Redemption --> Consumed : Payment Completes
    
    Consumed --> [*]
```

---

## 6. App Launch & Initialization

**Description:**
This state chart defines the lifecycle of the application during startup. It covers the loading of contexts (Auth, Language, Theme), checking for existing valid tokens, and routing the user to the appropriate initial screen (Login vs. Home).

```mermaid
stateDiagram-v2
    [*] --> App_Launched
    
    App_Launched --> Initializing_Contexts : Load AuthContext, LanguageContext
    Initializing_Contexts --> Checking_Storage : Read AsyncStorage
    
    Checking_Storage --> Token_Found : JWT Exists
    Checking_Storage --> No_Token : No JWT
    
    Token_Found --> Validating_Token : API /verify
    
    Validating_Token --> Token_Valid : Success
    Validating_Token --> Token_Expired : Auth Error
    
    Token_Valid --> Loading_User_Data : Fetch Profile
    Loading_User_Data --> Ready_Main_Tabs : Initialization Complete
    
    No_Token --> Ready_Auth_Stack : Show Login/Register
    Token_Expired --> Ready_Auth_Stack : Clear Storage & Show Login
    
    Ready_Main_Tabs --> [*]
    Ready_Auth_Stack --> [*]
```

---

## 7. Registration & OTP Validation Lifecycle

**Description:**
This state chart maps the states a user goes through when creating a new account. It includes form validation, API submission, the OTP verification layer, and the final account creation outcome.

```mermaid
stateDiagram-v2
    [*] --> Registration_Form
    
    Registration_Form --> Validating_Input : User Submits Data
    Validating_Input --> Form_Error : Invalid Email/Password Match
    Form_Error --> Registration_Form : User Corrects Input
    
    Validating_Input --> Submitting_Details : API /register
    Submitting_Details --> Awaiting_OTP : Success (Sent to Email)
    Submitting_Details --> Registration_Failed : Email Already Exists
    Registration_Failed --> Registration_Form : Retry
    
    Awaiting_OTP --> Verifying_OTP : User Enters OTP
    Verifying_OTP --> OTP_Invalid : Wrong Code
    OTP_Invalid --> Awaiting_OTP : Retry Entry
    
    Verifying_OTP --> Account_Created : Success / Verified
    Account_Created --> [*] : Redirect to Login
```

---

## 8. Forgot Password Lifecycle

**Description:**
This diagram maps the password recovery process. It transitions from requesting a reset, confirming ownership via a reset link or OTP, establishing a new password, and completing the reset cycle.

```mermaid
stateDiagram-v2
    [*] --> Request_Reset_Form
    
    Request_Reset_Form --> Submitting_Email : User Enters Identifier
    Submitting_Email --> Email_Not_Found : Account Doesn't Exist
    Email_Not_Found --> Request_Reset_Form : User Retries
    
    Submitting_Email --> Reset_Email_Sent : API /forgot-password Success
    
    Reset_Email_Sent --> Awaiting_Reset_Code : User Checks Inbox
    Awaiting_Reset_Code --> Validating_Code : User Submits OTP/Link
    Validating_Code --> Invalid_Code : Expired/Wrong
    Invalid_Code --> Awaiting_Reset_Code : Retry
    
    Validating_Code --> Enter_New_Password : Code Valid
    Enter_New_Password --> Submitting_New_Password : User Submits Form
    
    Submitting_New_Password --> Update_Success : Password Changed
    Submitting_New_Password --> Update_Failed : Policy Violation
    Update_Failed --> Enter_New_Password : Retry
    
    Update_Success --> [*] : Redirect to Login
```

---

## 9. History Management State (List, View, Delete)

**Description:**
This state chart covers how a user interacts with their scanned food history. It shows the fetching of the history list, viewing detailed results for a specific scan, and the deletion flow.

```mermaid
stateDiagram-v2
    [*] --> Fetching_History
    
    Fetching_History --> History_List_View : Data Loaded
    Fetching_History --> Error_State : API Failure
    Error_State --> Fetching_History : Retry
    
    History_List_View --> Viewing_Item_Details : User Selects Item
    Viewing_Item_Details --> History_List_View : User Goes Back
    
    History_List_View --> Confirming_Delete : User Swipes/Taps Delete
    Viewing_Item_Details --> Confirming_Delete : User Taps Delete Icon
    
    Confirming_Delete --> History_List_View : Cancelled
    Confirming_Delete --> Deleting_Item : Confirmed
    Deleting_Item --> History_List_View : Item Removed
    
    History_List_View --> [*] : User Leaves Screen
```

---

## 10. App Configuration & Language State

**Description:**
This state chart outlines the system's management of global configuration settings, specifically focusing on toggling themes or switching localizations/languages dynamically.

```mermaid
stateDiagram-v2
    [*] --> Settings_Menu
    
    Settings_Menu --> Changing_Language : Selects Locale
    Changing_Language --> Loading_Translations : Fetch i18n JSON
    Loading_Translations --> Applying_Context : Update LanguageContext
    Applying_Context --> Settings_Menu : UI Re-rendered
    
    Settings_Menu --> Toggling_Theme : Switch Light/Dark
    Toggling_Theme --> Updating_Theme_Prefs : Save to AsyncStorage
    Updating_Theme_Prefs --> Settings_Menu : UI Re-rendered (Dark/Light)
    
    Settings_Menu --> [*] : User Exits Settings
```
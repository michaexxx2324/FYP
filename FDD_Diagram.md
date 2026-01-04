# Feature Driven Development (FDD) Diagram

This document outlines the Feature Driven Development (FDD) model for the Food Additives Scanning App. It breaks down the system into major Subject Areas and lists the specific features (activities) within each area.

## FDD Model

```mermaid
graph TD
    %% Root Node
    Root[Food Additives Scanning App]
    
    %% Subject Areas
    Root --> Auth[User Account Management]
    Root --> Scan[Scanning & Analysis]
    Root --> Content[Community & Content]
    Root --> VIP[VIP Services]
    Root --> Game[Gamification]

    %% User Account Management Features
    Auth --> Auth1[Register New Account]
    Auth --> Auth2[Login to Account]
    Auth --> Auth3[Logout]
    Auth --> Auth4[Reset Password]
    Auth --> Auth5[Update Profile (Allergies/Diet)]
    Auth --> Auth6[View Profile Details]

    %% Scanning & Analysis Features
    Scan --> Scan1[Scan Barcode]
    Scan --> Scan2[Scan Label via OCR]
    Scan --> Scan3[View Product Details]
    Scan --> Scan4[Analyze Health Risks]
    Scan --> Scan5[Save Scan to History]
    Scan --> Scan6[View Scan History]
    Scan --> Scan7[Delete Scan History]

    %% Community & Content Features
    Content --> Cont1[View News Feed]
    Content --> Cont2[View News Details]
    Content --> Cont3[Comment on News]
    Content --> Cont4[View Blog Feed]
    Content --> Cont5[Create Blog Post]
    Content --> Cont6[Comment on Blog Post]

    %% VIP Services Features
    VIP --> VIP1[Upgrade to VIP Plan]
    VIP --> VIP2[Process Payment]
    VIP --> VIP3[View Calorie Tracker]
    VIP --> VIP4[Get Personalized Recipes]
    VIP --> VIP5[View Advanced Health Analysis]

    %% Gamification Features
    Game --> Game1[Play Discount Quiz]
    Game --> Game2[Calculate Quiz Score]
    Game --> Game3[Generate & Redeem Coupon]
    Game --> Game4[View Coupon Wallet]

    %% Styling
    classDef subject fill:#f9f,stroke:#333,stroke-width:2px;
    classDef feature fill:#e1f5fe,stroke:#333,stroke-width:1px;
    
    class Auth,Scan,Content,VIP,Game subject;
    class Auth1,Auth2,Auth3,Auth4,Auth5,Auth6 feature;
    class Scan1,Scan2,Scan3,Scan4,Scan5,Scan6,Scan7 feature;
    class Cont1,Cont2,Cont3,Cont4,Cont5,Cont6 feature;
    class VIP1,VIP2,VIP3,VIP4,VIP5 feature;
    class Game1,Game2,Game3,Game4 feature;
```

## Feature List Description

### 1. User Account Management
*   **Register New Account**: Allows users to create an account with email, username, password, and health preferences.
*   **Login to Account**: Authenticates users using email/username and password.
*   **Logout**: Securely ends the user session and clears local data.
*   **Reset Password**: Sends a password reset link to the user's registered email.
*   **Update Profile**: Allows users to modify their personal info, allergies, and dietary restrictions.
*   **View Profile Details**: Displays the user's current information and status.

### 2. Scanning & Analysis
*   **Scan Barcode**: Uses the camera to scan product barcodes and fetch data from the server.
*   **Scan Label via OCR**: Captures an image of the product label and uses AI to extract text.
*   **View Product Details**: Displays nutritional info, ingredients, and warnings.
*   **Analyze Health Risks**: Compares product ingredients against user allergies and diet to provide warnings.
*   **Save Scan to History**: Automatically saves scanned items to the user's history.
*   **View Scan History**: Lists all previously scanned items.
*   **Delete Scan History**: Allows users to remove items from their history.

### 3. Community & Content
*   **View News Feed**: Displays a list of food safety news and articles.
*   **View News Details**: Shows the full content of a selected news article.
*   **Comment on News**: Allows users to discuss news articles.
*   **View Blog Feed**: Displays community-generated posts.
*   **Create Blog Post**: Enables users to share their own food-related experiences.
*   **Comment on Blog Post**: Allows interaction on community posts.

### 4. VIP Services
*   **Upgrade to VIP Plan**: Interface for selecting and subscribing to a VIP plan.
*   **Process Payment**: Handles the external payment transaction.
*   **View Calorie Tracker**: Exclusive feature to track daily calorie intake.
*   **Get Personalized Recipes**: AI-generated recipes based on user preferences.
*   **View Advanced Health Analysis**: Detailed breakdown of health impacts of additives.

### 5. Gamification
*   **Play Discount Quiz**: A trivia game about food safety.
*   **Calculate Quiz Score**: Determines the user's performance.
*   **Generate & Redeem Coupon**: Awards a discount coupon for high scores.
*   **View Coupon Wallet**: Stores and displays earned coupons.

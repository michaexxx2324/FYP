# System Design Class Diagram

This document contains the System Design Class Diagram for the Food Additives Scanning App. It is divided into three main layers to represent the full-stack architecture: **Frontend (React Native)**, **Backend (Express.js)**, and **Database (MongoDB Models)**.

```mermaid
classDiagram

    %% ==========================================
    %% 1. FRONTEND LAYER (React Native / Services)
    %% ==========================================
    
    class AuthContext {
        -Object user
        -Boolean isAuthenticated
        -String token
        +login(email, password)
        +register(userData)
        +logout()
        +updateProfile(dietData)
        +upgradeToVIP()
    }

    class HistoryContext {
        -Array scanHistory
        +loadHistory()
        +addScanToHistory(scanData)
        +removeScan(scanId)
        +getScanQuota()
    }

    class AlertContext {
        -Array safetyAlerts
        +fetchAlerts()
        +getAlertById(id)
    }

    class LanguageContext {
        -String currentLanguage
        +switchLanguage(langCode)
    }

    class ocrService {
        +performOCR(base64Image)
        +parseIngredients(ocrText)
        +translateText(text)
    }

    class productService {
        +getProductByBarcode(barcode)
        +analyzeIngredients(ingredients, userAllergies, userHealth)
        +saveScanResult(result)
    }

    %% Frontend Relationships
    AuthContext --> productService : uses (for user rules)
    HistoryContext --> productService : uses (to save data)


    %% ==========================================
    %% 2. BACKEND LAYER (Node.js / Express Services)
    %% ==========================================

    class AuthController {
        +loginUser(req, res)
        +registerUser(req, res)
        +updateProfile(req, res)
        +resetPassword(req, res)
    }

    class ProductController {
        +getProduct(req, res)
        +saveScanHistory(req, res)
        +getScanQuota(req, res)
    }

    class BlogController {
        +getAllBlogs(req, res)
        +createBlog(req, res)
        +addComment(req, res)
        +toggleLike(req, res)
        +toggleFavorite(req, res)
    }

    class AlertService {
        +getLatestAlerts()
        +readAlertsJSON()
        +writeAlertsJSON(data)
    }

    class ScraperService {
        +fetchRSSFeed()
        +parseXMLData()
        +translateAlert()
        +deduplicateAlerts()
    }

    %% Backend Relationships
    ScraperService --> AlertService : Updates local JSON
    ProductController --> ProductModel : Queries
    ProductController --> ScanHistoryModel : Inserts
    AuthController --> UserModel : Queries/Inserts
    BlogController --> BlogModel : Queries/Inserts


    %% ==========================================
    %% 3. DATABASE MODELS (MongoDB & Entities)
    %% ==========================================

    class UserModel {
        +String _id
        +String username
        +String email
        +String password
        +Number age
        +Number height
        +Number weight
        +Array allergies
        +Array dietPreferences
        +Boolean isVip
    }

    class ProductModel {
        +String _id
        +String barcode
        +String itemName
        +String nutritionInformation
        +Array additives
    }

    class ScanHistoryModel {
        +String _id
        +String userId
        +String productId
        +Date scanTime
        +String healthAnalysis
        +String warningFlags
    }

    class FoodSafetyAlert {
        +String alertId
        +String title
        +String description
        +Date pubDate
        +String adviceToConsumers
        +String reason
    }

    class BlogModel {
        +String _id
        +String authorId
        +String title
        +String content
        +Date postDateTime
    }

    class BlogCommentModel {
        +String _id
        +String postId
        +String userId
        +String content
        +Date commentDateTime
    }

    class VIPFeature {
        +String featureId
        +String featureName
        +String description
    }

    %% Network / API connections (Frontend talking to Backend)
    AuthContext ..> AuthController : HTTP POST
    HistoryContext ..> ProductController : HTTP POST / GET
    AlertContext ..> AlertService : HTTP GET
    productService ..> ProductController : HTTP GET

    %% Database connections (Models related to each other)
    UserModel "1" --> "*" ScanHistoryModel : has
    UserModel "1" --> "*" BlogModel : authors
    UserModel "1" --> "*" BlogCommentModel : writes
    UserModel "1" --> "*" VIPFeature : accesses
    ScanHistoryModel "1" --> "1" ProductModel : references
    BlogModel "1" --> "*" BlogCommentModel : contains
    AlertService ..> FoodSafetyAlert : manages

```
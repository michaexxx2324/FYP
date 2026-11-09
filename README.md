# Food Additives Scanning App

Food Additives Scanning App helps users understand food products before buying or consuming them. The app can scan a product barcode, read a food label using OCR and AI, display nutrition information, highlight possible health concerns, and save scan results for later review.

It is built with **React Native and Expo** for the mobile application, **Node.js and Express** for the backend API, and **MongoDB** for product, user, scan-history, alert, and community data.

## What the app provides

- **Barcode scanning**: Scan supported product barcodes and retrieve product information from the database.
- **Food-label OCR**: Take a photo or choose an image of a label. AI extracts product name, ingredients, nutrition facts, origin, storage instructions, dates, volume, and allergen information.
- **Product analysis**: View nutrition information, warnings, and health analysis.
- **Scan history**: Search previous scans, reopen product details, or remove old entries.
- **Food safety alerts**: Read recent food-safety news and recall information.
- **Community blog**: Browse, search, create, like, dislike, comment on, and favorite posts.
- **User profiles**: Store health information, allergies, dietary preferences, and other profile details.
- **Multilingual interface**: Switch the supported app language from the language button.
- **VIP features**: Access unlimited scans and additional tools such as calorie analysis, recipe suggestions, and health analysis.
- **Discount quiz**: Play the partner-store quiz game and receive available discount coupons.

## How to use the app

1. Open the app and create an account, or sign in with an existing account.
2. Select **Scan** from the bottom navigation.
3. Choose one of the following:
   - **Barcode mode**: Point the camera at a product barcode and wait for the product details.
   - **OCR mode**: Take a photo of a food label or select an image from the gallery. Review the extracted text and submit it for analysis.
4. Read the product name, ingredients, nutrition information, warnings, and health analysis.
5. Use **History** to find previous scans.
6. Use **Home** to view recent scans, food alerts, and the discount quiz.
7. Use **Blog** to read or share community posts.
8. Use **Profile** and **Settings** to update personal information, health preferences, language, and VIP options.

### Scan limits

Non-VIP accounts have a daily scan quota. The remaining quota is shown on the Scan screen and resets at midnight. VIP accounts are not limited by this daily quota.

## Project structure

```text
FYP/
├── food_additives_scanning_app/   # Expo React Native mobile application
│   ├── app/                       # Screens and Expo Router routes
│   ├── components/                # Reusable UI components
│   ├── context/                   # Authentication, language, history, and alerts
│   └── services/                  # API and OCR services
├── simple-backend/                # Express API and MongoDB integration
│   ├── routes/                    # API route modules
│   ├── services/                  # Backend services
│   └── server.js                  # API server entry point
└── README.md
```

## Requirements

- Node.js and npm
- Expo CLI or the Expo Go mobile app
- MongoDB running locally on `127.0.0.1:27017`
- A Poe API key and bot name for AI label OCR and VIP AI features

## Installation and setup

### 1. Start MongoDB

Start a local MongoDB server, then initialize the database if required:

```bash
cd simple-backend
npm install
node initDatabase.js
```

The backend currently connects to the `foodlabel` database on the local MongoDB instance.

### 2. Configure the mobile app

Create or update `food_additives_scanning_app/.env`:

```env
API_URL=http://YOUR_COMPUTER_IP:3000/api
POE_API_KEY=your_poe_api_key
POE_BOT_NAME=your_poe_bot_name
```

Use your computer's local-network IP address when testing on a physical phone. Do not use `localhost` or `127.0.0.1` from a physical device because those addresses refer to the phone itself. Keep API keys private and do not commit them to source control.

Install the mobile dependencies:

```bash
cd food_additives_scanning_app
npm install
```

### 3. Start the backend

From the repository root:

```bash
cd simple-backend
npm start
```

The API listens on port `3000` by default. Confirm that the terminal reports a successful MongoDB connection.

### 4. Start the Expo app

In another terminal:

```bash
cd food_additives_scanning_app
npx expo start
```

Then scan the QR code with Expo Go, or press `a` for Android, `i` for iOS, or `w` for the web version when supported.

If the app has stale Expo cache or scanning problems, restart it with:

```bash
npx expo start --tunnel --clear
```

## Development notes

- The backend expects MongoDB to be available locally unless its connection configuration is changed.
- Camera access is required for barcode scanning and label photography.
- Gallery access is required for OCR image selection.
- Barcode results depend on matching product records in the MongoDB product collection.
- OCR and AI features require valid Poe configuration and an internet connection.
- When using a physical device, the device and development computer should normally be on the same network.

## Commit message conventions

Use the following prefixes when creating commits:

| Prefix | Purpose |
| --- | --- |
| `feat` | Add or modify a feature |
| `fix` | Fix a bug |
| `docs` | Documentation changes |
| `style` | Formatting-only changes |
| `refactor` | Code restructuring without a feature or bug fix |
| `perf` | Performance improvements |
| `test` | Add or improve tests |
| `chore` | Build or maintenance changes |
| `revert` | Revert an earlier change |
| `i18n` | Translation or localization changes |

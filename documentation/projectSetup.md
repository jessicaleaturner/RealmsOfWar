## Run Local Development Build
1. Install Node.js 26 LTS and npm 11 or later (`nvm use` picks the version from `.nvmrc`)
2. Setup MongoDB and Firebase 
4. Download project and unzip.
5. Setup .env file in project root. Current structure is:

        MONGO='mongodb url'
        FIREBASE_API_KEY='firebase apiKey'
        FIREBASE_AUTH_DOMAIN='firebase authDomain'
        FIREBASE_DATABASE_URL='firebase databaseURL'
        FIREBASE_PROJECT_ID='firebase projectId'
        FIREBASE_STORAGE_BUCKET='firebase storageBucket'
        FIREBASE_MESSAGING_SENDER_ID='firebase messagingSenderId'
        FIREBASE_APP_ID='firebase appId'
        FIREBASE_MEASUREMENT_ID='firebase measurementId'

6. In project root run:

        npm install

7. To setup default values into database, run:

        npm run database

7. To run project:

        npm run dev



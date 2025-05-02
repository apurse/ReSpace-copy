# Re-Space Front-end Application

This app is the front-end part of the Re-Space furniture moving system, providing users a friendly and easy-to-use system for controlling the Re-Space robots. The app allows for users to control the system from the convenience of their own device.

© Re-Space, 2025.

#### Authentication
Within the application, users can create accounts to access all system functionality. These accounts are comprised of a username and password.
Accounts are stored in a local SQLite database, but will be changed in future productions.

Once an account is created, users get access to the entire app system.

#### Furniture management


#### Layout management

### Prerequisites
1) ‘Node.js — Download Node.js®’. Accessed: Sep. 30, 2024. [Online]. Available: https://nodejs.org/en/download. Node Permissive MIT License.

## How to start the app

### Normal start:
1) Open a new terminal and enter: 
```
cd Re-Space-App; npm install; npx expo start -c
```

### Direct connection:
If normal start doesn't work, use a tunnel version for direct connections.
1) Open a new terminal and enter: 
```
cd Re-Space-App; npm install; npx expo start --tunnel -c
```

### Fix dependencies after update:
```
npm config set legacy-peer-deps true
```

## Dependencies

### React Native
React Native uses the MIT License, found at https://github.com/facebook/react-native/blob/main/LICENSE

### Expo 
Expo uses the MIT License, found at https://github.com/expo/expo/blob/main/LICENSE

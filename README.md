# Unofficial github API

## Unofficial github API to get your public repositories

### [Live Preview](https://bakunya-github-api.herokuapp.com/)

### Motivation
 
are you worried if sometime when you call api from github, get 403 rate limit? Use this for avoid that github api rate limit. Just clone, change ```GITHUB_USERNAME``` variable and push to your own server. No database required cause every call api will save on file and revalidate every 1 day.

### Requreiments
1. Nodejs 16.xx version
2. npm

### Installation
1. Clone this repositories

2. Type npm install
```bash 
npm install 
```

3. Change config variable with your own preferences at ```index.js``` file.
```js
// currently is
const IS_DEVELOPMENT = true
const GITHUB_USERNAME = 'bakunya'
const TIME_REVALIDATED_MS = 86400000
const CORS_WHITELIST = ['http://localhost:3000']
```

4. Then type npm start to start node server. Server will listening on port 8000
```bash 
npm start 
```
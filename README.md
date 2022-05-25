# Unofficial github API

## Unofficial github API to get your public repositories

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

3. Change ```GITHUB_USERNAME``` variable at ```index.js``` file.
```js
// currently value is bakunya
const GITHUB_USERNAME = 'bakunya'
```

4. Then type npm start to start node server. Server will listening on port 8000
```bash 
npm start 
```
# Sharkdown

Sharkdown is a responsive editor for markdown documents in the cloud.

Sharkdown extends the markdown spec with 2 new features:

1. Multi-page support
2. Image gallery support

This repository contains both the Vue.js frontend and Express.js backend for the application.

![Alt text](readmeImages/galleryView.png)
![Alt text](readmeImages/splitView.png)
![Alt text](readmeImages/mobileView.png)

## Frontend

To run the frontend, first install the required packages:

```
cd frontend
npm i
```

Run the dev server or build for deployment using the following commands, respectively:

```
npm run dev
npm run build
```

## Backend

To run the backend, install the required packages, and run the serve command:

```
cd backend
npm i
npm run serve
```

This will run the API server's 'app.ts' file directly via tsx.

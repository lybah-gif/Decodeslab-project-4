# Expense Tracker
A modern, high-performance Full Stack financial dashboard built to record, edit, filter, and track business and personal expenses. The project features a fast **Node.js/Express REST API** backend and a client **Single Page Application (SPA)** frontend complete with dynamic metrics, real-time search query filtering, dark/light theme properties, and robust offline local caching fallbacks.
---
## Key Features
* **Full CRUD Operations**: Record new bills, delete outdated records, and modify/edit existing transactions via pop-up form modals.
* **Global Search Filtering**: Real-time matching filter across Vendor Company, Representative, Services, Descriptions, and Bill IDs.
* **Auto-Routing Search Box**: Typing into the global search bar on any page redirects the user to the log table to display filtered results in real-time.
* **Light / Dark Mode System**: Fully styled using custom CSS Variables (Colors mapped using HSL values) that dynamically adapt when toggled from the Settings screen.
* **Interactive Dashboard Widgets**: Real-time updates for Total Monthly Expenses, Overall Budgets, Paid vs. Pending invoice counts, and category statistics chips (Marketing, Hosting, Software, Office).
* **Offline-First Synchronization**: Automatically detects network status; if the API backend goes offline, it seamlessly falls back to caching and modifying data inside browser `localStorage`, ensuring zero data loss.
* **Premium Typography & UI**: Powered by Google Font **Plus Jakarta Sans** with clean fluid grids, layout hover lifts, and transition animations.
* **Responsive Layout**: Adapts gracefully to Desktop monitors, Tablets (via sticky horizontal navigation tab list), and Mobile devices.
---
## Technology Stack
* **Frontend (Single Page Application)**:
  * **HTML5**: Semantic layout elements (`aside`, `main`, `section`, `article`) and input suggestion datalists.
  * **CSS3**: Custom property theme variables, layouts via CSS Grid & Flexbox, webkit-scrollbars, and linear animation keyframes.
  * **Vanilla JavaScript (ES6)**: State management, SPA tab navigation, asynchronous REST API fetches, and local cache synchronization.
* **Backend REST API**:
  * **Node.js**: Asynchronous backend JavaScript runtime environment.
  * **Express.js**: Backend framework processing routing, body JSON parsing, and controller endpoints.
  * **CORS Middleware**: Manages cross-origin headers to allow secure communication between frontend and backend ports.
---
## File Structure
```text
expense-tracker-app/
├── backend/
│   ├── node_modules/        # Backend server node modules
│   ├── package.json         # Server scripts & core dependencies (express, cors)
│   ├── package-lock.json
│   └── server.js            # Express API, in-memory DB arrays, and endpoints
├── frontend/
│   ├── index.html           # SPA structure, modal panels, & search inputs
│   ├── style.css            # Dark/light variables, grids, custom scrollbars
│   └── script.js            # CRUD functions, page managers, and fetch logic
├── .gitignore               # Ignores dependencies, environment configs, and OS logs
└── README.md                # Project documentation
```
---
## How to Run locally
### 1. Start the REST API Backend
Open your terminal, navigate to the `backend` directory, and launch the server:
```bash
cd backend
npm install
node server.js
```
The console will log:
`Backend server running on http://localhost:5000`
`API URL: http://localhost:5000/api/expenses`
### 2. Run the Client Frontend
1. Open the `/frontend` directory.
2. Double-click `index.html` to open it directly in a web browser, or serve it using an editor extension like **Live Server** (recommended).
3. The dashboard connects to the API server automatically. If you stop the server, it will display a toast notification and continue running in offline cache mode.
---
## API Endpoints
The Express backend exposes the following endpoints on port `5000`:
| Request Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/expenses` | Fetch all logged expense bills. |
| `POST` | `/api/expenses` | Add a new expense bill (body: JSON). |
| `PUT` | `/api/expenses/:id` | Update an existing expense bill (body: JSON). |
| `DELETE` | `/api/expenses/:id` | Remove an expense bill by its database ID. |
---
## Trainee Declaration
* **Student Name**: Laiba Zahid
* **Internship Batch**: 2026
* **Project Title**: Full Stack Project 4 – Responsive Expense Tracker
* **Academy / Training Program**: DecodeLabs Industrial Training Program 2026

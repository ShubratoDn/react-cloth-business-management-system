# React Cloth Business Management System

A full-stack web application to streamline and automate the operations of a cloth business. This project covers inventory, procurement, sales, product, stakeholder, store, and user management, providing a comprehensive dashboard and reporting tools.

**Frontend:** React.js (this repo)  
**Backend:** Java Spring Boot ([Backend Repo](https://github.com/ShubratoDn/Cloth-Business-Management-System))

---

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Contribution](#contribution)
- [License](#license)
- [Contact](#contact)

---

## Project Overview

**Cloth Business Management System** is designed to help cloth businesses manage their operations efficiently. It provides modules for inventory, procurement, sales, product, stakeholder, store, and user management, along with dashboards and reporting tools.

---

## Tech Stack

### Frontend
- **React.js** (v18+)
- **Redux** for state management
- **React Router** for routing
- **CoreUI** for UI components and theming
- **Axios** for API requests
- **Formik** and **Yup** for forms and validation
- **Chart.js** for data visualization
- **React Toastify** for notifications
- **Sass** for styling

### Backend
- **Java Spring Boot**  
  See: [Cloth-Business-Management-System Backend](https://github.com/ShubratoDn/Cloth-Business-Management-System)

---

## Features

### Dashboard
- Business KPIs, charts, and quick stats

### Stock Management
- Stock overview and search

### Procurement Management
- Create, update, and view purchase orders
- Purchase history and status updates

### Sales Management
- Create, update, and view sales
- Sales history and status updates

### Product Management
- Add and search products

### Stakeholder Management
- Add and manage stakeholders

### Store Management
- Add, assign, and find stores

### User & Role Management
- Add users, assign roles, and manage permissions

### Other
- Authentication (login/logout)
- Error pages (401, 404, 500)
- Notifications and widgets

---

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation

```bash
git clone <this-repo-url>
cd react-cloth-business-management-system
npm install
```

### Running the App

```bash
npm start
```

The app will run at [http://localhost:3000](http://localhost:3000).

> **Note:**  
> Make sure the backend server is running. See [backend instructions](https://github.com/ShubratoDn/Cloth-Business-Management-System).

---

## Folder Structure

```
src/
  ├── assets/                # Images, icons, etc.
  ├── base/                  # Base UI components
  ├── buttons/               # Button components
  ├── charts/                # Chart components
  ├── components/            # Shared React components
  ├── configs/               # App configuration files
  ├── dashboard/             # Dashboard and main chart
  ├── forms/                 # Form components
  ├── icons/                 # Icon components
  ├── layout/                # Layout components (DefaultLayout, etc.)
  ├── misReport/             # Management Information System reports
  ├── notifications/         # Notification components
  ├── pages/                 # Error and auth pages
  ├── procurementManagement/ # Procurement features
  ├── productManagement/     # Product features
  ├── salesManagement/       # Sales features
  ├── scss/                  # Styles (Sass)
  ├── services/              # API and business logic
  ├── stakeholderManagement/ # Stakeholder features
  ├── stockManagement/       # Stock features
  ├── storeManagement/       # Store features
  ├── theme/                 # Theme and style config
  ├── userManagement/        # User features
  ├── userRole/              # User role features
  ├── views/                 # Main views/pages
  ├── widgets/               # Dashboard widgets
  ├── App.js                 # Main app entry
  ├── index.js               # React entry point
  └── routes.js              # App routes
```

---

## Environment Variables

If you need to configure API endpoints or other environment-specific settings, create a `.env` file in the root:

```
REACT_APP_API_URL=http://localhost:8080/api
```

---

## Scripts

- `npm start` – Start development server
- `npm run build` – Build for production
- `npm test` – Run tests
- `npm run eject` – Eject from Create React App

---

## Contribution

Contributions are welcome! Please fork the repo and submit a pull request.

---


## Contact

For questions or support, please open an issue or contact me.
Phone: 01759458961
Email: shubratodn44985@gmail.com

---

**Backend Repo:**  
[https://github.com/ShubratoDn/Cloth-Business-Management-System](https://github.com/ShubratoDn/Cloth-Business-Management-System)

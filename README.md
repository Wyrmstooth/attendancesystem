# AttendanceIQ

A modern, full-stack smart attendance management system for universities and colleges.  
Built with **Spring Boot** (Java) for the backend and **React** (TypeScript) for the frontend.

---

## ✨ Features

- **Role-based Access:** Student, Instructor, and Admin dashboards
- **Attendance Management:** Mark, view, and analyze attendance
- **Course & Session Management:** Create courses, schedule sessions, enroll students
- **Notifications:** Real-time notifications for absences and system events
- **Secure Authentication:** JWT-based login, registration, and password reset
- **Beautiful UI:** Responsive, accessible, and mobile-friendly design
- **Admin Tools:** Manage users, courses, sessions, and enrollment with ease

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/attendanceiq.git
cd attendanceiq
```

### 2. Backend Setup

- **Requirements:** Java 17+, Maven, MySQL
- Configure your database in `backend/src/main/resources/application.properties`
- Start the backend:

```bash
cd backend
./backend.sh
```

- Default admin credentials:
  - **Email:** `admin@example.com`
  - **Password:** `Admin123!`

### 3. Frontend Setup

- **Requirements:** Node.js 18+, npm or yarn
- Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

- Visit [http://localhost:5173](http://localhost:5173)

---

## 🖥️ Screenshots

<p align="center">
  <img src="docs/dashboard.png" alt="Dashboard" width="700"/>
</p>
<p align="center">
  <img src="docs/admin-panel.png" alt="Admin Panel" width="700"/>
</p>
<p align="center">
  <img src="docs/attendance-marking.png" alt="Attendance Marking" width="700"/>
</p>

---

## 🛠️ Tech Stack

- **Backend:** Java, Spring Boot, Spring Security, JPA/Hibernate, MySQL
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Auth:** JWT (JSON Web Tokens)
- **Notifications:** Real-time via REST API

---

## 📚 Documentation

- [API Endpoints](docs/api.md)
- [Database Schema](docs/schema.png)
- [Deployment Guide](docs/deploy.md)

---

## 🤝 Contributing

Contributions are welcome!  
Please open issues and pull requests for improvements or bug fixes.

---

## 📄 License

MIT License.  
© {year} AttendanceIQ Team

---

## 🙏 Acknowledgements

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)

# 🎟️ Event Management System

A full-stack enterprise-style Event Management platform designed for seamless event creation, user registrations, role-based access control (RBAC), real-time attendance tracking, and comprehensive notification systems.

---

## 🛠️ Tech Stack

### **Backend**
* **Java 17+:** Modern Java runtime with latest features
* **Spring Boot 3.x:** Core REST APIs, dependency injection, and service-layer architecture
* **Spring Security 6:** Stateless authentication with lambda-based configuration
* **JWT (JSON Web Tokens):** Secure token-based authorization
* **Spring Data MongoDB:** Document database integration for high scalability and flexibility
* **MongoDB Atlas:** Cloud-hosted NoSQL database for reliability and automatic scaling
* **JUnit 5 & Mockito:** Comprehensive automated backend testing with mocking
* **Lombok:** Reduce boilerplate with annotations for getters, setters, constructors
* **Spring Mail/SendGrid:** Email notifications and confirmations

### **Frontend**
* **React 19:** Modern component-driven architecture with latest hooks and features
* **TypeScript:** Type-safe development for better code quality and IDE support
* **Vite:** Lightning-fast build tool and development server with HMR
* **Redux Toolkit:** Predictable global state management for events, users, and UI state
* **React Router:** Client-side routing for seamless navigation
* **Tailwind CSS:** Utility-first CSS framework for responsive design
* **Axios:** HTTP client for API communication

---

## ✨ Key Features & Workflows

### 🔐 **Authentication & Security**
* Secure user registration and login using JWT tokens
* Password hashing with Spring Security's built-in encoders
* Role-based access control (`ADMIN` and `USER` roles)
* Protected API routes with token validation
* Custom exceptions for user management (UserAlreadyExistsException, UserNotFoundException)
* Stateless authentication for scalability

### 🎪 **Event Management (Admin)**
* **Create Events:** Add events with custom categories, capacity limits, locations, and speaker details
* **Edit Events:** Update event information and manage availability
* **Delete Events:** Remove events and cascade data cleanup
* **Attendee Management:** View live attendee lists in modal with user details
* **Check-In System:** Real-time attendance tracking with timestamp recording
  - Click "Check In" to instantly update attendee status from `REGISTERED` to `ATTENDED`
  - No page reload required for immediate feedback
  - Audit trail with exact check-in timestamps

### 👥 **Event Registration (User)**
* **Event Browsing:** Discover upcoming events with beautiful card layouts
* **Advanced Search:** Filter by event name, description, and location
* **Category Filtering:** Sort events by custom categories
* **Dynamic Sorting:** Order events by date (upcoming/past) or capacity availability
* **One-Click Registration:** Simple registration flow with instant confirmation
* **Cancel Registration:** Withdraw from events with a single action
* **Registered Events:** Personal dashboard showing all registered and attended events

### 📊 **Dashboard & User Experience**
* **Admin Dashboard:** Comprehensive overview of all events and attendees
* **User Profile:** View personal information and registration history
* **Real-time Notifications:** Instant feedback on actions and event updates
* **Error Handling:** Robust error messages via responsive alerts
* **Loading States:** Clean, intuitive loading indicators during async operations

---

## 🚀 Getting Started Locally

### Prerequisites
* **Java Development Kit (JDK 17 or higher)**
  - Download: [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.java.net/)
  - Verify: `java -version`

* **Node.js & npm (v18+ recommended)**
  - Download: [Node.js Official Site](https://nodejs.org/)
  - Verify: `node -v` and `npm -v`

* **MongoDB Atlas Account (Free Tier Available)**
  - Create account: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  - Create cluster and obtain connection URI
  - Whitelist IP: Add your IP to network access list

* **Maven (v3.6+)**
  - Included with most Java IDEs
  - Verify: `mvn -version`

---

## 📋 Installation & Setup

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/yourusername/event-management-system.git
cd event-management-system
```

### **Step 2: Backend Setup (Spring Boot)**

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Configure Application Properties
Edit `src/main/resources/application.properties`:

```properties
# MongoDB Connection
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster.mongodb.net/event_management_db?retryWrites=true&w=majority
spring.data.mongodb.database=event_management_db

# JWT Configuration
jwt.secret=YourSuperSecretJwtKeyHereWithMinimum32Characters
jwt.expiration=86400000

# Email Configuration (SendGrid)
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=SG.YourSendGridApiKey
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Server Configuration
server.port=8080
spring.application.name=event-management-system
```

**Environment Variables (Alternative to application.properties):**
```bash
export MONGODB_URI=mongodb+srv://...
export JWT_SECRET=YourSuperSecretKey
export SENDGRID_API_KEY=SG.YourKey
```

#### 2.3 Build and Run Backend
```bash
# Clean and build
mvn clean install

# Run the application
mvn spring-boot:run

# Backend will start on http://localhost:8080
```

#### 2.4 Verify Backend
```bash
# Check if server is running
curl http://localhost:8080/health
```

### **Step 3: Frontend Setup (React)**

#### 3.1 Navigate to Frontend Directory
```bash
cd frontend
```

#### 3.2 Install Dependencies
```bash
npm install
```

#### 3.3 Configure Environment Variables
Create `.env` file in frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Event Management System
```

#### 3.4 Start Development Server
```bash
npm run dev

# Frontend will start on http://localhost:5173
```

#### 3.5 Build for Production
```bash
npm run build

# Output in dist/ directory ready for deployment
```

---

## 📚 API Documentation

### **Authentication Endpoints**

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response (201):
{
  "id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### **Event Endpoints**

#### Get All Events (with Pagination & Filters)
```http
GET /api/events?page=0&size=10&category=Tech&search=Conference
Authorization: Bearer {token}

Response (200):
{
  "content": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Tech Conference 2024",
      "description": "Annual tech conference",
      "date": "2024-12-15T09:00:00Z",
      "location": "San Francisco",
      "category": "Tech",
      "capacity": 500,
      "registeredCount": 245,
      "speaker": "John Tech",
      "createdBy": "admin_user"
    }
  ],
  "totalElements": 15,
  "totalPages": 2
}
```

#### Create Event (Admin Only)
```http
POST /api/events
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Web Development Workshop",
  "description": "Learn modern web development",
  "date": "2024-12-20T14:00:00Z",
  "location": "New York",
  "category": "Workshop",
  "capacity": 50,
  "speaker": "Jane Developer"
}

Response (201):
{
  "id": "507f1f77bcf86cd799439013",
  "title": "Web Development Workshop",
  ...
}
```

#### Get Event Details
```http
GET /api/events/{eventId}
Authorization: Bearer {token}

Response (200):
{
  "id": "507f1f77bcf86cd799439012",
  "title": "Tech Conference 2024",
  ...
  "attendees": [
    {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "registrationStatus": "REGISTERED",
      "checkedIn": false
    }
  ]
}
```

#### Update Event (Admin Only)
```http
PUT /api/events/{eventId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Updated Event Title",
  "capacity": 600
}

Response (200): Updated event object
```

#### Delete Event (Admin Only)
```http
DELETE /api/events/{eventId}
Authorization: Bearer {admin_token}

Response (204): No Content
```

### **Registration Endpoints**

#### Register for Event
```http
POST /api/registrations/{eventId}
Authorization: Bearer {token}

Response (201):
{
  "id": "507f1f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439011",
  "eventId": "507f1f77bcf86cd799439012",
  "registrationStatus": "REGISTERED",
  "registeredAt": "2024-11-01T10:30:00Z"
}
```

#### Cancel Registration
```http
DELETE /api/registrations/{registrationId}
Authorization: Bearer {token}

Response (204): No Content
```

#### Check-In Attendee (Admin Only)
```http
PUT /api/registrations/{registrationId}/check-in
Authorization: Bearer {admin_token}

Response (200):
{
  "id": "507f1f77bcf86cd799439014",
  "registrationStatus": "ATTENDED",
  "checkedInAt": "2024-12-15T09:15:00Z"
}
```

### **User Endpoints**

#### Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer {token}

Response (200):
{
  "id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "registeredEvents": [
    {
      "eventId": "507f1f77bcf86cd799439012",
      "title": "Tech Conference 2024",
      "status": "ATTENDED"
    }
  ]
}
```

#### Get User Registrations
```http
GET /api/users/me/registrations
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "507f1f77bcf86cd799439014",
    "eventId": "507f1f77bcf86cd799439012",
    "eventTitle": "Tech Conference 2024",
    "registrationStatus": "ATTENDED",
    "registeredAt": "2024-11-01T10:30:00Z"
  }
]
```

---

## 📁 Project Structure

```
event-management-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/event/
│   │   │   │   ├── config/
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   └── CorsConfig.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── EventController.java
│   │   │   │   │   ├── UserController.java
│   │   │   │   │   └── RegistrationController.java
│   │   │   │   ├── entity/
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Event.java
│   │   │   │   │   └── EventRegistration.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── UserRequestDTO.java
│   │   │   │   │   ├── UserResponseDTO.java
│   │   │   │   │   ├── EventDTO.java
│   │   │   │   │   └── RegistrationDTO.java
│   │   │   │   ├── exception/
│   │   │   │   │   ├── UserAlreadyExistsException.java
│   │   │   │   │   ├── UserNotFoundException.java
│   │   │   │   │   └── EventNotFoundException.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── EventRepository.java
│   │   │   │   │   └── RegistrationRepository.java
│   │   │   │   ├── security/
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   └── CustomUserDetailsService.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── EventService.java
│   │   │   │   │   ├── UserService.java
│   │   │   │   │   ├── RegistrationService.java
│   │   │   │   │   └── EmailService.java
│   │   │   │   └── EventManagementApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   │       └── java/com/event/
│   │           ├── service/
│   │           │   └── EventServiceTest.java
│   │           └── controller/
│   │               └── EventControllerTest.java
│   ├── pom.xml
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── Events/
│   │   │   │   ├── EventCard.tsx
│   │   │   │   ├── EventList.tsx
│   │   │   │   ├── EventDetails.tsx
│   │   │   │   └── EventForm.tsx
│   │   │   ├── Admin/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AttendeeModal.tsx
│   │   │   │   └── EventManagement.tsx
│   │   │   ├── User/
│   │   │   │   ├── UserProfile.tsx
│   │   │   │   └── MyRegistrations.tsx
│   │   │   └── Common/
│   │   │       ├── Navbar.tsx
│   │   │       ├── Footer.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── store/
│   │   │   ├── authSlice.ts
│   │   │   ├── eventSlice.ts
│   │   │   ├── registrationSlice.ts
│   │   │   └── store.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── eventService.ts
│   │   │   └── registrationService.ts
│   │   ├── utils/
│   │   │   ├── tokenUtils.ts
│   │   │   └── formatters.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── .env
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
└── README.md (this file)
```

---

## 🧪 Testing

### Backend Testing (JUnit 5 & Mockito)

#### Run All Tests
```bash
cd backend
mvn test
```

#### Run Specific Test Class
```bash
mvn test -Dtest=EventServiceTest
```

#### Run with Coverage Report
```bash
mvn test jacoco:report
# Report available at: target/site/jacoco/index.html
```

#### Example Test Structure
```java
@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventService eventService;

    @Test
    void testCreateEvent_Success() {
        // Arrange
        EventDTO eventDTO = new EventDTO(...);
        Event savedEvent = new Event(...);
        when(eventRepository.save(any())).thenReturn(savedEvent);

        // Act
        Event result = eventService.createEvent(eventDTO);

        // Assert
        assertNotNull(result);
        verify(eventRepository, times(1)).save(any());
    }
}
```

### Frontend Testing (Coming Soon)
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Cypress or Playwright

---

## 🚢 Deployment

### **Backend Deployment**

#### Option 1: Render.com (Recommended for Free Tier)
1. Push backend to GitHub
2. Connect Render account to GitHub
3. Create new Web Service
4. Configure environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `SENDGRID_API_KEY`
5. Deploy!

#### Option 2: Railway.app
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option 3: AWS EC2
```bash
# SSH into instance
ssh -i key.pem ec2-user@your-instance-ip

# Install Java and Maven
sudo yum install java-17-amazon-corretto
sudo yum install maven

# Clone and run
git clone your-repo
cd backend
mvn spring-boot:run
```

### **Frontend Deployment**

#### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel deploy
```

#### Option 2: Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables in Netlify dashboard
5. Auto-deploy on push

#### Option 3: GitHub Pages
```bash
npm run build
git add dist
git commit -m "Deploy"
git push origin main
```

---

## 🔐 Security Best Practices

✅ **Implemented:**
- JWT token-based authentication (stateless)
- Password hashing with bcrypt (Spring Security)
- CORS configured for frontend domain only
- Role-based access control (RBAC) on all admin endpoints
- Input validation on all DTOs
- MongoDB injection prevention via parameterized queries
- HTTPS enforced in production

⚠️ **Recommendations for Production:**
- Enable HTTPS only (redirect HTTP to HTTPS)
- Use strong JWT secret (min 32 characters)
- Implement rate limiting on auth endpoints
- Add request logging and monitoring
- Regular security audits and dependency updates
- Implement refresh token rotation
- Add CSRF protection if using cookies

---

## 📝 Environment Variables Reference

### Backend
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event_management_db

# JWT
JWT_SECRET=YourMinimum32CharacterSecretKeyHere
JWT_EXPIRATION=86400000

# Email (SendGrid)
SENDGRID_API_KEY=SG.YourApiKeyHere

# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=production
```

### Frontend
```env
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_APP_NAME=Event Management System
```

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
- Verify MongoDB Atlas cluster is running
- Check if IP whitelist includes your machine
- Validate connection URI format
- Confirm network connectivity: `ping cluster.mongodb.net`

**JWT Token Errors**
- Ensure `JWT_SECRET` is at least 32 characters
- Check token expiration in application.properties
- Verify token is included in Authorization header: `Bearer {token}`

**CORS Errors**
- Confirm frontend URL matches CORS configuration
- Check if requests include credentials
- Verify Content-Type headers

### Frontend Issues

**API Connection Failed**
- Confirm backend is running on correct port
- Check `VITE_API_BASE_URL` environment variable
- Verify browser DevTools Network tab for failed requests
- Check browser console for CORS errors

**Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Update dependencies: `npm update`
- Check Node version: `node -v` (should be v18+)

---

## 📚 Additional Resources

* [Spring Boot Documentation](https://spring.io/projects/spring-boot)
* [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
* [MongoDB Documentation](https://docs.mongodb.com/)
* [React TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/jsx.html)
* [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs)
* [Vite Guide](https://vitejs.dev/guide/)

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/event-management-system.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Ensure tests pass

### Code Style Guidelines
- Backend: Follow Spring Boot conventions, use meaningful variable names
- Frontend: Use TypeScript, follow React best practices, use functional components
- Both: Add comments for complex logic, write meaningful commit messages

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Mehak** - Java Backend Developer & Full-Stack Enthusiast
- GitHub: [@yourgithub](https://github.com/yourgithub)
- LinkedIn: [Your LinkedIn](https://linkedin.com)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

* **GUVI-HCL Training Program** for comprehensive full-stack curriculum
* **Spring Boot & React Communities** for excellent documentation
* **MongoDB Atlas** for reliable cloud database
* All contributors and testers who helped improve this project

---

## 📞 Support

Found a bug or have a question? Please open an [issue](https://github.com/yourusername/event-management-system/issues) on GitHub.

---

**Last Updated:** November 2024
**Status:** ✅ Production Ready

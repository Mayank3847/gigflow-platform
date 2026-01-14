# GigFlow - Freelance Marketplace Platform

A full-stack MERN application for connecting clients with freelancers. Features secure authentication, real-time notifications, and transactional integrity.

## 🚀 Features

- ✅ Secure JWT Authentication with HttpOnly Cookies
- ✅ Post and Browse Gigs
- ✅ Bid on Projects
- ✅ Search and Filter Functionality
- ✅ Hire Freelancers with Atomic Transactions (MongoDB)
- ✅ Real-time Notifications with Socket.io
- ✅ Responsive UI with Tailwind CSS

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Redux Toolkit
- Tailwind CSS
- Socket.io-client
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Socket.io

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas Account

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT Secret
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://gigflow_admin:YTq2WlIq2mXW2Dbj@gigflowcluster.bllygvt.mongodb.net/?appName=GigFlowCluster
JWT_SECRET=c3b08befefaca97d60fad4926314cf0564ed03ea184ff01c257b373382429452ab694cb17b090914ac592d22bfffb8bd3da5a21619dc6ed4b4989e799221251emin_32_characters_long
NODE_ENV=development
CLIENT_URL=https://gigflow-platform-ms7295.netlify.app/
```

### Frontend (.env)
VITE_API_URL=https://gigflow-backend-qfln.onrender.com
## 📱 Usage

1. Register a new account
2. Post a gig or browse existing gigs
3. Place bids on gigs
4. Hire freelancers from received bids
5. Receive real-time notifications when hired

## 🔒 Security Features

- **Bonus 1**: MongoDB Transactions prevent race conditions during hiring
- **Bonus 2**: Real-time Socket.io notifications
- HttpOnly cookies for secure token storage
- Password hashing with bcrypt

## 🚀 Deployment

**Frontend**: Netlify 
**Frontend URL**:https://gigflow-platform-ms7295.netlify.app/                
**Backend**: Render.com  
**Backend URL**https://gigflow-backend-qfln.onrender.com            
**Database**: MongoDB Atlas


**Live Link**:https://gigflow-platform-ms7295.netlify.app/


## 📝 API Endpoints



### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/me` - Get current user

### Gigs
- GET `/api/gigs` - Get all gigs (with search)
- GET `/api/gigs/:id` - Get single gig
- POST `/api/gigs` - Create new gig
- GET `/api/gigs/my/posted` - Get my posted gigs

### Bids
- POST `/api/bids` - Create new bid
- GET `/api/bids/:gigId` - Get all bids for a gig
- GET `/api/bids/my/bids` - Get my bids
- PATCH `/api/bids/:bidId/hire` - Hire a freelancer

## 👨‍💻 Author

Mayank Shekhar
Email: mayankshekhar0303@gmail.com
LinkedIn:https://www.linkedin.com/in/mayank-shekhar-44a81328a/
GitHub:https://github.com/Mayank3847
Contact:7295059168

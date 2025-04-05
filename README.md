# PanaFX - International Money Transfer Platform

A modern web application for secure international money transfers, built with HTML, SCSS, and JavaScript, powered by Supabase for authentication and database management.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Core Features](#core-features)
- [Security](#security)
- [Contributing](#contributing)

## Features

### User Management
- User registration with email/password
- Profile management with KYC verification
- Two-factor authentication support
- Password reset functionality
- User status management (pending, approved, rejected)
- Admin dashboard for user management
- Document verification system
- Activity logging

### Money Transfer
- International money transfers
- Real-time exchange rate calculation
- Transaction fee calculation (5% of transfer amount)
- Multi-currency support (USD, EUR, GBP)
- Transaction status tracking
- Admin approval workflow
- Real-time notifications
- Transfer request system

### Account Management
- Profile information updates
- Document upload and verification
- Security settings (2FA, password)
- Transaction history with filtering
- Notification preferences
- Account status monitoring

### Admin Features
- User verification and approval
- Transaction monitoring and management
- Document verification workflow
- System configuration
- Activity logging and auditing
- User suspension and deletion

## Tech Stack

### Frontend
- HTML5
- SCSS/CSS3
- JavaScript (ES6+)
- Bootstrap 5.3
- jQuery 3.7
- DataTables 2.0
- ApexCharts 3.45
- Feather Icons 4.29
- Dropzone 5.9

### Backend & Infrastructure
- Supabase 2.39
  - Authentication
  - PostgreSQL Database
  - Storage
  - Real-time subscriptions
- Node.js
- Gulp 5.0 (Build system)

## Project Structure

```
new-app-panafx/
├── src/
│   ├── html/
│   │   ├── index.html          # Dashboard
│   │   ├── login.html          # Login page
│   │   ├── register.html       # Registration page
│   │   ├── reset-password.html # Password reset
│   │   ├── onboarding.html     # User onboarding
│   │   ├── send-money.html     # Money transfer
│   │   ├── request-transfer.html # Transfer request
│   │   ├── transactions-request.html # Transaction history
│   │   ├── user-management.html # Admin user management
│   │   └── my-account.html     # User profile
│   ├── js/
│   │   ├── app.js             # Main application
│   │   ├── helpers.js         # Utility functions
│   │   ├── authService.js     # Authentication
│   │   ├── transactionService.js # Transaction handling
│   │   ├── userService.js     # User management
│   │   └── notificationService.js # Notifications
│   ├── scss/
│   │   ├── components/        # Component styles
│   │   ├── layout/           # Layout styles
│   │   ├── pages/            # Page-specific styles
│   │   └── main.scss         # Main stylesheet
│   └── images/               # Image assets
├── dist/                     # Built files
├── gulpfile.js              # Build configuration
└── package.json             # Dependencies
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm 8+
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd new-app-panafx
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Build the project:
```bash
npm run build
```

5. Start the development server:
```bash
npm start
```

## Development

### Available Scripts
- `npm start` - Start development server with live reload
- `npm run build` - Build for production
- `npm run watch` - Watch for changes
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run prepare` - Install Husky hooks

### Build Process
The build process uses Gulp and includes:
- SCSS compilation with PostCSS processing
- JavaScript bundling and minification
- Image optimization
- Vendor file management
- Source map generation
- Live reload functionality

### Code Quality Tools
- ESLint for JavaScript linting
- Prettier for code formatting
- Husky for git hooks
- lint-staged for staged files
- Jest for testing

### Coding Standards
- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use BEM methodology for CSS
- Maintain component-based architecture
- Write comprehensive documentation

## Security

### Data Protection
- Input validation
- XSS prevention
- CSRF protection
- Secure file uploads
- Data encryption

### Access Control
- Role-based access control
- Row Level Security policies
- Session management
- API rate limiting

### File Storage
- Secure document storage
- Access control for uploads
- File type validation
- Size limitations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
1. Follow the coding standards
2. Write unit tests for new features
3. Update documentation
4. Test thoroughly before submitting PR
5. Keep commits atomic and descriptive

## Support

For support, email support@panafx.com or join our Slack channel. 
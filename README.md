# StayPets - Multi-Page Application (MPA)

A modern multi-page web application developed with cutting-edge technologies for pet management and veterinary services.

## 🚀 Features

- **MPA Architecture**: Multi-page application with smooth navigation
- **Modern Interface**: Responsive design with custom CSS
- **Data Management**: REST API with JSON Server
- **Notifications**: Elegant alerts with SweetAlert2
- **Optimized Development**: Vite configuration for fast development

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Mock Backend**: JSON Server
- **Alerts**: SweetAlert2
- **Bundler**: Vite

## 📁 Project Structure

```
PROJECT-AUTH/
├── node_modules/
├── public/
│   └── db.json
├── src/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── utils/
│   │   |   ├── loading.js
│   │   |   ├── sweetalert.js
│   │   ├── dashboard.js
│   │   ├── dashboardW.js
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── main.js
│   │   └── register.js
│   └── views/
│       ├── dashboard.html
│       ├── dashboardW.html
│       ├── login.html
│       └── register.html
├── .gitignore
├── index.html
├── package-lock.json
└── package.json
```

## 🚀 Installation and Usage

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Luisr26/MPA_StayPets.git
cd MPA_StayPets
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. In another terminal, start JSON Server:
```bash
npm run server
```

### Available Scripts

- `npm run dev` - Starts the development server with Vite
- `npm run build` - Builds the application for production
- `npm run preview` - Previews the production build
- `npm run server` - Starts JSON Server for the mock API

## 🎯 Functionality

### Main Pages

- **Home (`index.html`)**: Welcome page
- **Login (`login.html`)**: User authentication
- **Register (`register.html`)**: New user registration
- **Dashboard (`dashboard.html`)**: Main user panel
- **Dashboard Worker (`dashboardW.html`)**: Worker panel

### JavaScript Modules

- **Utils**: Reusable utility functions
- **Loading**: Loading state management
- **SweetAlert**: Notification configuration
- **Dashboard**: Main panel logic
- **Auth**: Authentication management

## 🔧 Configuration

### JSON Server

The application uses JSON Server to simulate a REST API. The `db.json` file contains the data structure.

### Vite

Optimized configuration for fast development and efficient builds.

## 🌟 Technical Features

- **Responsive Design**: Compatible with mobile and desktop devices
- **State Management**: Efficient application state handling
- **Form Validation**: Real-time validation
- **SPA-like Navigation**: Smooth navigation between pages
- **Optimization**: Optimized and minified code for production

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Luis Alfredo**
- GitHub: [@Luisr26](https://github.com/Luisr26)
- Email: luisoro009@gmail.com
- Clan: Cienaga

---

### 📚 Academic Context

**Module 3 - Week 3 Project**

This project is part of the academic curriculum, developed as part of learning modern web technologies and MPA (Multi-Page Application) architecture.

---

*Developed with ❤️ by Luis Alfredo - Clan Cienaga*

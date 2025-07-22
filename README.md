# Under Deck

<div align="center">
  <img src="Domain/src/img/UDIx256.ico" alt="Under Deck Logo" width="128" height="128">
  
  **A powerful tool for streamers and general users**
  
  [![Readme](https://img.shields.io/badge/README%20PT-BR)](https://github.com/UNDER192103/under-deck/README-PT-BR.md)
  [![Version](https://img.shields.io/badge/version-2.0.10-blue.svg)](https://github.com/UNDER192103/under-deck/releases)
  [![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE.md)
  [![Electron](https://img.shields.io/badge/Electron-37.2.0-47848f.svg)](https://electronjs.org/)
</div>

## 📋 About the Project

Under Deck is a desktop application developed in Electron that was created primarily to help streamers, but is also useful for general use. It offers an intuitive interface to manage applications, create custom shortcuts, and control your computer remotely through a web interface.

## ✨ Main Features

### 🚀 **Application Management**
- Register application executables
- Add website URLs
- Include audio files
- Execute custom CMD commands
- Customize display names and icons

### 🌐 **Web Under Deck**
- Web interface for remote control (local networks only)
- Access via URL or QR Code
- Execute applications from your computer remotely
- Ideal for streamers to control their setup from a distance

### ⌨️ **Keyboard Shortcuts**
- Create custom keyboard shortcuts
- Support for applications, audio, URLs, and CMD commands
- Fast and efficient execution
- Example: CTRL + D to open Discord

### 📱 **Integrated Web Pages**
- Open websites within Under Deck
- Navigation without needing external browser
- Quick access to frequently used sites

### ⚙️ **Advanced Settings**
- Enable/disable shortcuts
- Port configuration for Web Under Deck
- Interface customization
- Local network settings

## 🛠️ Technologies Used

- **Electron** 37.2.0 - Main framework
- **Node.js** - JavaScript runtime
- **Express** - Internal web server
- **Socket.io** - Real-time communication
- **Discord RPC** - Discord integration
- **RobotJS** - System automation
- **OBS WebSocket** - OBS Studio integration

## 📦 Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation via Release
1. Go to the [Releases](https://github.com/UNDER192103/under-deck/releases) page
2. Download the latest version for Windows
3. Run the installer and follow the instructions

### Local Development
```bash
# Clone the repository
git clone https://github.com/UNDER192103/under-deck.git

# Enter the directory
cd under-deck

# Install dependencies
npm install

# Run the application
npm start
```

## 🔧 Available Scripts

```bash
# Start application
npm start

# Build for production
npm run build

# Windows-specific build
npm run build:win

# Rebuild native modules
npm run rebuild
```

## 🎯 Use Cases

### For Streamers
- **Remote Control**: Use your phone to control applications during stream
- **Quick Shortcuts**: Quickly access Discord, OBS, games, etc.
- **Organization**: Keep all tools organized in one place
- **Automation**: Execute custom commands and scripts

### For General Users
- **Productivity**: Quick access to frequent applications
- **Automation**: Execute repetitive tasks with shortcuts
- **Organization**: Centralize access to websites and applications
- **Remote Control**: Control your PC from other devices on the network

## 🔒 Security

- ✅ Works only on local networks (Wi-Fi/Ethernet)
- ✅ No exposure to external internet
- ✅ Full control over access permissions
- ✅ Web interface protected by local network

## 🤝 Contributing

Contributions are always welcome! To contribute:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- **GitHub**: [Issues](https://github.com/UNDER192103/under-deck/issues)
- **Discord**: under_nouzen
- **Email**: undernouzen@gmail.com

## 📄 License

This project is under the ISC license. See the [LICENSE.md](LICENSE.md) file for more details.

## 🚧 Development Status

Some features are still under development and will undergo changes soon. Follow the releases for updates!

---

<div align="center">
  Developed with ❤️ by <a href="https://github.com/UNDER192103">UNDER</a>
</div>

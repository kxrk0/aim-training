# 🎯 AIM TRAINER PRO - Desktop Application

Professional FPS Aim Training Desktop Application built with Electron.

## 🚀 Features

### Desktop Experience
- **Native Desktop App** - No browser required
- **Native Menus** - Platform-specific menu bars
- **Keyboard Shortcuts** - Professional desktop shortcuts
- **File Operations** - Save/load configurations natively
- **Performance Optimized** - Direct system access

### Cross-Platform Support
- ✅ **Windows** (NSIS installer)
- ✅ **macOS** (DMG package)  
- ✅ **Linux** (AppImage)

### Gaming Features
- 🎯 **Advanced Aim Training** - Multiple game modes
- 👥 **Multiplayer Party System** - Real-time 1v1 matches
- 📊 **Performance Analytics** - Detailed statistics
- 🏆 **Achievement System** - Progress tracking
- ⚙️ **Sensitivity Calculator** - Cross-game settings

## 🛠️ Development Setup

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 8.0.0
```

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/aim-trainer-desktop.git
cd aim-trainer-desktop

# Install dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### Development Mode
```bash
# Start in development mode (auto-reload)
npm run electron:dev

# Or manually start each component:
# Terminal 1: Start backend server
npm run server:dev

# Terminal 2: Start frontend
npm run client:dev

# Terminal 3: Start Electron
npm run electron
```

## 📦 Building & Distribution

### Build for Development
```bash
# Build all components
npm run build

# Test production build
npm run electron
```

### Package for Distribution
```bash
# Build and package for current platform
npm run electron:pack

# Build for distribution (all platforms)
npm run electron:dist
```

### Platform-Specific Commands
```bash
# Windows (from Windows)
npm run electron:pack -- --win

# macOS (from macOS)
npm run electron:pack -- --mac

# Linux (from Linux)
npm run electron:pack -- --linux
```

## ⌨️ Keyboard Shortcuts

### Training
- `Ctrl/Cmd + T` - Training Hub
- `Ctrl/Cmd + P` - Quick Practice
- `Ctrl/Cmd + S` - Sensitivity Settings

### Social
- `Ctrl/Cmd + L` - Party Lobby
- `Ctrl/Cmd + B` - Leaderboard

### General
- `Ctrl/Cmd + ,` - Preferences
- `F11` - Toggle Fullscreen
- `Ctrl/Cmd + R` - Reload
- `Ctrl/Cmd + Q` - Quit (macOS: Cmd+Q, Windows/Linux: Ctrl+Q)

## 🎮 Usage Guide

### Starting the Application
1. **Launch** the app from your desktop or applications folder
2. **Sign in** with Google for full features
3. **Choose your training mode** from the Training Hub
4. **Start practicing** and improving your aim!

### Party System
1. **Create Party** - Generate invite code
2. **Share Code** - Send 6-character code to friends
3. **Start Match** - Ready up and begin 1v1 training
4. **View Results** - Analyze performance after match

### Sensitivity Calculator
1. **Enter current game settings** (DPI, sensitivity)
2. **Select target game** from supported list
3. **Get converted settings** for optimal consistency

## 🔧 Configuration

### Game Settings
- **Display Mode**: Fullscreen, Windowed, Borderless
- **Graphics Quality**: Low, Medium, High, Ultra
- **Audio**: Master volume, effects, music
- **Controls**: Mouse sensitivity, key bindings

### Data Storage
- **Windows**: `%APPDATA%/AIM TRAINER PRO/`
- **macOS**: `~/Library/Application Support/AIM TRAINER PRO/`
- **Linux**: `~/.config/AIM TRAINER PRO/`

## 🛡️ Security Features

- **Sandboxed Renderer** - Web content runs in isolated context
- **Context Isolation** - No direct Node.js access from UI
- **Secure Communication** - IPC with validation
- **External Link Protection** - Safe handling of external URLs

## 🐛 Troubleshooting

### Application Won't Start
1. Check Node.js version: `node --version`
2. Reinstall dependencies: `npm install`
3. Clear cache: `npm run clean && npm install`

### Performance Issues
1. **Close unnecessary applications**
2. **Update graphics drivers**
3. **Lower graphics settings** in preferences
4. **Check system requirements**

### Connection Problems
1. **Check internet connection**
2. **Disable VPN temporarily**
3. **Check firewall settings**
4. **Restart application**

## 📁 Project Structure

```
aim-training-desktop/
├── electron/                 # Electron main process
│   ├── main.js              # Main Electron entry point
│   ├── preload.js           # Secure preload script
│   └── renderer.js          # Renderer utilities
├── client/                   # Frontend React app
│   ├── src/                 # React source code
│   ├── dist/                # Built frontend
│   └── package.json         # Frontend dependencies
├── server/                   # Backend Node.js server
│   ├── src/                 # Server source code
│   ├── dist/                # Built server
│   └── package.json         # Server dependencies
├── assets/                   # App icons and resources
│   ├── icon.png             # Base icon
│   ├── icon.ico             # Windows icon
│   └── icon.icns            # macOS icon
├── dist/                     # Electron build output
└── package.json             # Main package configuration
```

## 🚀 Deployment

### Auto-Updater (Future)
```javascript
// Will be implemented for automatic updates
const { autoUpdater } = require('electron-updater')
```

### CI/CD Pipeline (Future)
- **GitHub Actions** for automated builds
- **Code signing** for Windows/macOS
- **Automatic releases** on tag push

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-username/aim-trainer-desktop/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/your-username/aim-trainer-desktop/discussions)
- 📧 **Email**: support@aimtrainer.pro

---

**Made with ❤️ for the competitive gaming community** 
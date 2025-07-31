# AI Chatbot - Gemini Powered

A modern, responsive AI chatbot application powered by Google's Gemini AI model. Features a sleek ChatGPT-style interface with advanced functionality and customization options.

![AI Chatbot](https://img.shields.io/badge/AI-Gemini%20Powered-blue)
![Python](https://img.shields.io/badge/Python-3.9+-green)
![Flask](https://img.shields.io/badge/Flask-3.0.0-red)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## ✨ Features

### 🎨 **Modern UI/UX**
- **ChatGPT-style interface** with glass-morphism design
- **Dark/Light/Auto themes** with smooth transitions
- **Responsive design** that works on all devices
- **3D animated background** using Spline
- **GSAP-powered animations** for smooth interactions

### 🤖 **AI Capabilities**
- **Real-time streaming responses** from Google Gemini 1.5 Flash
- **Markdown support** with syntax highlighting
- **Code block rendering** with copy functionality
- **Regenerate responses** feature
- **Chat history management**

### 🛠 **Advanced Features**
- **Three-dot menu** with comprehensive options
- **Settings modal** with persistent preferences
- **Keyboard shortcuts** for power users
- **Copy & paste functionality** for messages and code
- **Export chat history** as text files
- **Auto-scroll and timestamps** options

### ⌨️ **Keyboard Shortcuts**
- `Enter` - Send message
- `Shift + Enter` - New line
- `Ctrl + K` - Clear chat
- `Ctrl + D` - Toggle theme
- `Ctrl + S` - Export chat
- `Esc` - Close modals

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-chatbot
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open in browser**
   Navigate to `http://localhost:5000`

## 📁 Project Structure

```
ai-chatbot/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── .env                  # Environment variables (create this)
├── .gitignore           # Git ignore rules
├── templates/
│   └── index.html       # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css    # Comprehensive styling
│   └── js/
│       └── app.js       # Frontend JavaScript logic
```

## 🛠 Configuration

### Environment Variables
- `GEMINI_API_KEY` - Your Google Gemini API key (required)
- `FLASK_ENV` - Set to `development` for debug mode (optional)

### Settings
The application includes a settings modal where users can customize:
- **Theme preferences** (Auto/Light/Dark)
- **Font size** adjustment
- **Chat behavior** options
- **Animation speed** controls
- **Sound effects** toggle

## 🎯 Usage

### Basic Chat
1. Type your message in the input field
2. Press Enter or click the send button
3. Watch the AI respond in real-time

### Advanced Features
- **Copy messages**: Click the copy button below AI responses
- **Regenerate**: Click regenerate to get a new response
- **Settings**: Access via the three-dot menu in the header
- **Export**: Download your chat history as a text file
- **Clear**: Remove all messages and start fresh

## 🔧 Customization

### Themes
The application supports three theme modes:
- **Auto**: Follows system preference
- **Light**: Clean, bright interface
- **Dark**: Easy on the eyes for night use

### Styling
Modify `static/css/style.css` to customize:
- Color schemes
- Typography
- Layout spacing
- Animation timings

### Functionality
Extend `static/js/app.js` to add:
- New keyboard shortcuts
- Additional settings
- Custom message handling
- Enhanced UI interactions

## 🌐 API Integration

The application uses Google's Gemini 1.5 Flash model for AI responses. Key features:
- **Streaming responses** for real-time output
- **Error handling** with user-friendly messages
- **Session management** for conversation context
- **Rate limiting** protection

## 📱 Mobile Support

Fully responsive design with:
- Touch-friendly interface
- Optimized layouts for small screens
- Gesture support for common actions
- Progressive Web App capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for the powerful language model
- **GSAP** for smooth animations
- **Font Awesome** for beautiful icons
- **Marked.js** for markdown parsing
- **Flask** for the robust backend framework

## 📧 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your browser and Python version

---

**Made with ❤️ and AI**

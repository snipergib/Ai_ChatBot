class ChatBot {
    constructor() {
        this.isLoading = false;
        this.eventSource = null;
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
        console.log('ChatBot constructor starting...');
        
        try {
            this.init();
        } catch (error) {
            console.error('Error in ChatBot constructor:', error);
            // Force hide loading screen even if initialization fails
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }
    }
    
    init() {
        console.log('ChatBot initializing...');
        
        try {
            this.setupElements();
            this.setupEventListeners();
            this.setupTheme();
            this.setupAnimations();
            this.autoResizeTextarea();
            this.setupKeyboardShortcuts();
            this.loadSettings(); // Load saved settings
            this.applySettings();
            
            console.log('ChatBot initialization completed successfully');
        } catch (error) {
            console.error('Error during initialization:', error);
        } finally {
            // Always hide loading screen, regardless of errors
            console.log('Hiding loading screen...');
            this.hideLoadingScreen();
            
            // Also add a backup timeout to force hide loading screen
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen && loadingScreen.style.display !== 'none') {
                    console.log('Force hiding loading screen after timeout');
                    loadingScreen.style.display = 'none';
                }
            }, 2000);
        }
    }
    
    setupElements() {
        console.log('Setting up elements...');
        this.elements = {
            form: document.getElementById('chat-form'),
            input: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            messagesContainer: document.getElementById('messages-container'),
            typingIndicator: document.getElementById('typing-indicator'),
            welcomeMessage: document.getElementById('welcome-message'),
            themeToggle: document.getElementById('theme-toggle'),
            clearBtn: document.getElementById('clear-btn'),
            exportBtn: document.getElementById('export-btn'),
            charCounter: document.getElementById('char-counter'),
            loadingScreen: document.getElementById('loading-screen'),
            appContainer: document.getElementById('app-container'),
            menuBtn: document.getElementById('menu-btn'),
            dropdownMenu: document.getElementById('dropdown-menu'),
            settingsBtn: document.getElementById('settings-btn'),
            aboutBtn: document.getElementById('about-btn'),
            keyboardShortcutsBtn: document.getElementById('keyboard-shortcuts-btn'),
            feedbackBtn: document.getElementById('feedback-btn'),
            settingsModal: document.getElementById('settings-modal'),
            aboutModal: document.getElementById('about-modal'),
            shortcutsModal: document.getElementById('shortcuts-modal')
        };
        
        // Check if all elements were found
        const missingElements = [];
        Object.keys(this.elements).forEach(key => {
            if (!this.elements[key]) {
                console.error(`Element not found: ${key}`);
                missingElements.push(key);
            } else {
                console.log(`Element found: ${key}`);
            }
        });
        
        if (missingElements.length > 0) {
            console.warn(`Missing elements: ${missingElements.join(', ')}`);
            console.log('App will continue without these elements');
        }
    }
    
    setupEventListeners() {
        // Form submission
        this.elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
        
        // Auto-resize textarea
        this.elements.input.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.updateCharCounter();
        });
        
        // Enter key handling
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Clear chat
        this.elements.clearBtn.addEventListener('click', () => {
            this.clearChat();
        });
        
        // Export chat
        this.elements.exportBtn.addEventListener('click', () => {
            this.exportChat();
        });
        
        // Menu and settings
        this.elements.menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdownMenu();
        });
        
        this.elements.settingsBtn.addEventListener('click', () => {
            this.hideDropdownMenu();
            this.showModal('settings');
        });
        
        this.elements.aboutBtn.addEventListener('click', () => {
            this.hideDropdownMenu();
            this.showModal('about');
        });
        
        this.elements.keyboardShortcutsBtn.addEventListener('click', () => {
            this.hideDropdownMenu();
            this.showModal('shortcuts');
        });
        
        this.elements.feedbackBtn.addEventListener('click', () => {
            this.hideDropdownMenu();
            this.showFeedbackForm();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.menuBtn.contains(e.target) && !this.elements.dropdownMenu.contains(e.target)) {
                this.hideDropdownMenu();
            }
        });
        
        // Modal close handlers
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });
        
        // Modal overlay click to close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideAllModals();
                }
            });
        });
        
        // Settings handlers
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });
        
        // Font size slider update
        const fontSizeSlider = document.getElementById('font-size');
        if (fontSizeSlider) {
            const updateFontSize = () => {
                const value = fontSizeSlider.value;
                const valueDisplay = fontSizeSlider.parentElement.querySelector('.slider-value');
                if (valueDisplay) {
                    valueDisplay.textContent = value + 'px';
                }
                // Apply immediately for preview
                document.documentElement.style.setProperty('--chat-font-size', value + 'px');
            };
            
            fontSizeSlider.addEventListener('input', updateFontSize);
            updateFontSize(); // Set initial value
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.clearChat();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                    case 's':
                        e.preventDefault();
                        this.exportChat();
                        break;
                }
            } else if (e.key === 'Escape') {
                this.hideAllModals();
                this.hideDropdownMenu();
            }
        });
    }
    
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }
    
    setupAnimations() {
        console.log('Setting up animations...');
        
        // Check if GSAP is available
        if (typeof gsap === 'undefined') {
            console.error('GSAP not loaded!');
            return;
        }
        
        // Entrance animations with error handling
        try {
            gsap.from('.app-title', {
                duration: 1,
                y: -50,
                opacity: 0,
                ease: 'power3.out',
                delay: 0.2
            });
            
            gsap.from('.header-controls > *', {
                duration: 0.8,
                y: -30,
                opacity: 0,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.4
            });
            
            gsap.to('.welcome-message', {
                duration: 1,
                opacity: 1,
                y: 0,
                ease: 'power3.out',
                delay: 0.6
            });
            
            gsap.from('.input-container', {
                duration: 1,
                y: 100,
                opacity: 0,
                ease: 'power3.out',
                delay: 0.8
            });
            console.log('Animations set up successfully');
        } catch (error) {
            console.error('Error setting up animations:', error);
        }
    }
    
    hideLoadingScreen() {
        console.log('hideLoadingScreen called');
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) {
            console.error('Loading screen element not found!');
            return;
        }
        
        console.log('Found loading screen element, hiding...');
        
        // Use GSAP animation if available, otherwise fall back to simple hide
        if (typeof gsap !== 'undefined') {
            gsap.to(loadingScreen, {
                duration: 0.5,
                opacity: 0,
                ease: 'power2.out',
                onComplete: () => {
                    loadingScreen.style.display = 'none';
                    console.log('Loading screen hidden with GSAP animation');
                }
            });
        } else {
            // Fallback without GSAP
            console.log('GSAP not available, using fallback');
            loadingScreen.style.transition = 'opacity 0.5s ease';
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                console.log('Loading screen hidden with fallback method');
            }, 500);
        }
    }
    
    autoResizeTextarea() {
        const textarea = this.elements.input;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    updateCharCounter() {
        const count = this.elements.input.value.length;
        this.elements.charCounter.textContent = `${count}/2000`;
        
        if (count > 1800) {
            this.elements.charCounter.style.color = 'var(--warning-color)';
        } else if (count > 1950) {
            this.elements.charCounter.style.color = 'var(--error-color)';
        } else {
            this.elements.charCounter.style.color = 'var(--text-secondary)';
        }
    }
    
    async sendMessage() {
        const message = this.elements.input.value.trim();
        if (!message || this.isLoading) return;
        
        this.isLoading = true;
        this.elements.sendBtn.disabled = true;
        
        // Hide welcome message
        if (this.elements.welcomeMessage.style.display !== 'none') {
            gsap.to(this.elements.welcomeMessage, {
                duration: 0.5,
                opacity: 0,
                y: -20,
                ease: 'power2.out',
                onComplete: () => {
                    this.elements.welcomeMessage.style.display = 'none';
                }
            });
        }
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.elements.input.value = '';
        this.autoResizeTextarea();
        this.updateCharCounter();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            
            // Handle streaming response
            this.handleStreamingResponse(response);
            
        } catch (error) {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, there was an error processing your request. Please try again.', 'ai');
        }
    }
    
    async handleStreamingResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiMessageElement = null;
        let fullResponse = '';
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            
                            if (data.type === 'start') {
                                this.hideTypingIndicator();
                                aiMessageElement = this.addMessage('', 'ai');
                            } else if (data.type === 'content' && aiMessageElement) {
                                fullResponse += data.text;
                                this.updateMessageContent(aiMessageElement, fullResponse);
                            } else if (data.type === 'end') {
                                fullResponse = data.full_text;
                                if (aiMessageElement) {
                                    this.updateMessageContent(aiMessageElement, fullResponse);
                                }
                            } else if (data.type === 'error') {
                                this.hideTypingIndicator();
                                this.addMessage('Sorry, there was an error: ' + data.message, 'ai');
                            }
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Stream reading error:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, there was an error processing the response.', 'ai');
        } finally {
            this.isLoading = false;
            this.elements.sendBtn.disabled = false;
            this.elements.input.focus();
        }
    }
    
    addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        // Create message wrapper for avatar and content
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `avatar ${role}-avatar`;
        avatarDiv.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (role === 'ai') {
            contentDiv.innerHTML = this.parseMarkdown(content);
            
            // Add copy buttons to code blocks after a short delay to ensure DOM is ready
            setTimeout(() => {
                this.addCodeCopyButtons(contentDiv);
            }, 100);
        } else {
            contentDiv.textContent = content;
        }
        
        messageWrapper.appendChild(avatarDiv);
        messageWrapper.appendChild(contentDiv);
        messageDiv.appendChild(messageWrapper);
        
        // Add action buttons for AI messages
        if (role === 'ai') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'action-btn copy-action';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.title = 'Copy entire message';
            copyBtn.setAttribute('aria-label', 'Copy message to clipboard');
            
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyToClipboard(content, copyBtn, 'Copied!');
            });
            
            // Regenerate button
            const regenerateBtn = document.createElement('button');
            regenerateBtn.className = 'action-btn regenerate-action';
            regenerateBtn.innerHTML = '<i class="fas fa-redo"></i> Regenerate';
            regenerateBtn.title = 'Regenerate response';
            regenerateBtn.setAttribute('aria-label', 'Regenerate this response');
            
            regenerateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.regenerateResponse(messageDiv);
            });
            
            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(regenerateBtn);
            messageDiv.appendChild(actionsDiv);
        }
        
        this.elements.messagesContainer.appendChild(messageDiv);
        
        // Enhanced animation with stagger effect
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(messageDiv, 
                { 
                    opacity: 0, 
                    y: 30,
                    scale: 0.95
                },
                { 
                    duration: 0.6, 
                    opacity: 1, 
                    y: 0,
                    scale: 1,
                    ease: 'power2.out',
                    onComplete: () => {
                        this.scrollToBottom();
                        
                        // Animate action buttons if they exist
                        const actions = messageDiv.querySelector('.message-actions');
                        if (actions) {
                            gsap.fromTo(actions, 
                                { opacity: 0, y: 10 },
                                { 
                                    opacity: 1, 
                                    y: 0, 
                                    duration: 0.4,
                                    ease: 'power2.out',
                                    delay: 0.2
                                }
                            );
                        }
                    }
                }
            );
            
            // Animate avatar separately for a nice effect
            gsap.fromTo(avatarDiv,
                {
                    scale: 0,
                    rotation: -180
                },
                {
                    scale: 1,
                    rotation: 0,
                    duration: 0.5,
                    ease: 'back.out(1.7)',
                    delay: 0.1
                }
            );
        } else {
            this.scrollToBottom();
        }
        
        return contentDiv;
    }
    
    updateMessageContent(element, content) {
        // Update the content
        element.innerHTML = this.parseMarkdown(content);
        
        // Re-add copy buttons to code blocks
        setTimeout(() => {
            this.addCodeCopyButtons(element);
        }, 100);
        
        this.scrollToBottom();
    }
    
    regenerateResponse(messageElement) {
        // Find the last user message to regenerate response for
        const allMessages = this.elements.messagesContainer.querySelectorAll('.message');
        let lastUserMessage = null;
        
        // Find the user message that comes before this AI message
        for (let i = 0; i < allMessages.length; i++) {
            if (allMessages[i] === messageElement) {
                // Look backward to find the user message
                for (let j = i - 1; j >= 0; j--) {
                    if (allMessages[j].classList.contains('user-message')) {
                        lastUserMessage = allMessages[j].querySelector('.message-content').textContent;
                        break;
                    }
                }
                break;
            }
        }
        
        if (!lastUserMessage) {
            console.error('Could not find user message to regenerate response for');
            return;
        }
        
        // Update regenerate button state
        const regenerateBtn = messageElement.querySelector('.regenerate-action');
        if (regenerateBtn) {
            const originalHTML = regenerateBtn.innerHTML;
            regenerateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Regenerating...';
            regenerateBtn.classList.add('regenerating');
            regenerateBtn.disabled = true;
        }
        
        // Remove the current AI message
        const messageContent = messageElement.querySelector('.message-content');
        messageContent.innerHTML = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Regenerate the response
        this.sendMessageForRegeneration(lastUserMessage, messageElement);
    }
    
    async sendMessageForRegeneration(message, targetMessageElement) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error('Failed to regenerate response');
            }
            
            // Handle streaming response for regeneration
            this.handleRegenerationResponse(response, targetMessageElement);
            
        } catch (error) {
            console.error('Error regenerating response:', error);
            this.hideTypingIndicator();
            
            // Reset regenerate button
            const regenerateBtn = targetMessageElement.querySelector('.regenerate-action');
            if (regenerateBtn) {
                regenerateBtn.innerHTML = '<i class="fas fa-redo"></i> Regenerate';
                regenerateBtn.classList.remove('regenerating');
                regenerateBtn.disabled = false;
            }
            
            // Show error message
            const messageContent = targetMessageElement.querySelector('.message-content');
            messageContent.innerHTML = '<p>Sorry, there was an error regenerating the response. Please try again.</p>';
        }
    }
    
    async handleRegenerationResponse(response, targetMessageElement) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            
                            if (data.type === 'start') {
                                this.hideTypingIndicator();
                            } else if (data.type === 'content') {
                                fullResponse += data.text;
                                const messageContent = targetMessageElement.querySelector('.message-content');
                                this.updateMessageContent(messageContent, fullResponse);
                            } else if (data.type === 'end') {
                                fullResponse = data.full_text;
                                const messageContent = targetMessageElement.querySelector('.message-content');
                                this.updateMessageContent(messageContent, fullResponse);
                            } else if (data.type === 'error') {
                                this.hideTypingIndicator();
                                const messageContent = targetMessageElement.querySelector('.message-content');
                                messageContent.innerHTML = '<p>Sorry, there was an error: ' + data.message + '</p>';
                            }
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Stream reading error:', error);
            this.hideTypingIndicator();
            const messageContent = targetMessageElement.querySelector('.message-content');
            messageContent.innerHTML = '<p>Sorry, there was an error processing the regenerated response.</p>';
        } finally {
            // Reset regenerate button
            const regenerateBtn = targetMessageElement.querySelector('.regenerate-action');
            if (regenerateBtn) {
                regenerateBtn.innerHTML = '<i class="fas fa-redo"></i> Regenerate';
                regenerateBtn.classList.remove('regenerating');
                regenerateBtn.disabled = false;
            }
        }
    }
    
    addCodeCopyButtons(container) {
        const codeBlocks = container.querySelectorAll('pre');
        codeBlocks.forEach(pre => {
            // Remove existing copy button if any
            const existingBtn = pre.querySelector('.code-copy-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.title = 'Copy code';
            
            const codeContent = pre.querySelector('code') ? pre.querySelector('code').textContent : pre.textContent;
            copyBtn.addEventListener('click', () => this.copyToClipboard(codeContent, copyBtn, 'Copied!'));
            
            pre.appendChild(copyBtn);
        });
    }
    
    async copyToClipboard(text, button, successText = 'Copied!') {
        try {
            await navigator.clipboard.writeText(text);
            
            // Visual feedback
            const originalHTML = button.innerHTML;
            const originalClass = button.className;
            
            button.innerHTML = `<i class="fas fa-check"></i> ${successText}`;
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.className = originalClass;
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy text: ', err);
            
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                const originalHTML = button.innerHTML;
                const originalClass = button.className;
                
                button.innerHTML = `<i class="fas fa-check"></i> ${successText}`;
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.className = originalClass;
                }, 2000);
            } catch (fallbackErr) {
                console.error('Fallback copy failed: ', fallbackErr);
            }
            
            document.body.removeChild(textArea);
        }
    }
    
    parseMarkdown(text) {
        if (typeof marked !== 'undefined') {
            // Configure marked for better code highlighting
            marked.setOptions({
                highlight: function(code, lang) {
                    return `<code class="language-${lang || 'text'}">${code}</code>`;
                },
                breaks: true,
                gfm: true
            });
            return marked.parse(text);
        }
        
        // Enhanced fallback markdown parsing
        return text
            // Code blocks (triple backticks)
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                const language = lang ? ` class="language-${lang}"` : '';
                return `<pre><code${language}>${code.trim()}</code></pre>`;
            })
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Line breaks
            .replace(/\n/g, '<br>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    }
    
    showTypingIndicator() {
        this.elements.typingIndicator.style.display = 'block';
        gsap.to(this.elements.typingIndicator, {
            duration: 0.3,
            opacity: 1,
            ease: 'power2.out',
            onComplete: () => {
                this.scrollToBottom();
            }
        });
    }
    
    hideTypingIndicator() {
        gsap.to(this.elements.typingIndicator, {
            duration: 0.3,
            opacity: 0,
            ease: 'power2.out',
            onComplete: () => {
                this.elements.typingIndicator.style.display = 'none';
            }
        });
    }
    
    scrollToBottom() {
        const container = this.elements.messagesContainer.parentElement;
        gsap.to(container, {
            duration: 0.5,
            scrollTop: container.scrollHeight,
            ease: 'power2.out'
        });
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
        
        // Theme transition animation
        gsap.to(this.elements.appContainer, {
            duration: 0.3,
            ease: 'power2.out'
        });
    }
    
    updateThemeIcon() {
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    async clearChat() {
        if (!confirm('Are you sure you want to clear the chat history?')) {
            return;
        }
        
        try {
            const response = await fetch('/api/clear-chat', {
                method: 'POST'
            });
            
            if (response.ok) {
                // Animate messages out
                const messages = this.elements.messagesContainer.querySelectorAll('.message');
                gsap.to(messages, {
                    duration: 0.3,
                    opacity: 0,
                    y: -20,
                    stagger: 0.05,
                    ease: 'power2.out',
                    onComplete: () => {
                        this.elements.messagesContainer.innerHTML = '';
                        this.elements.welcomeMessage.style.display = 'block';
                        gsap.to(this.elements.welcomeMessage, {
                            duration: 0.5,
                            opacity: 1,
                            y: 0,
                            ease: 'power2.out'
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error clearing chat:', error);
            alert('Failed to clear chat. Please try again.');
        }
    }
    
    async exportChat() {
        try {
            const response = await fetch('/api/export-chat');
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = response.headers.get('Content-Disposition').split('filename=')[1];
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                alert('No chat history to export.');
            }
        } catch (error) {
            console.error('Error exporting chat:', error);
            alert('Failed to export chat. Please try again.');
        }
    }

    // Menu functionality
    toggleDropdownMenu() {
        const menu = this.elements.dropdownMenu;
        const isVisible = menu.style.display === 'block';
        menu.style.display = isVisible ? 'none' : 'block';
    }

    hideDropdownMenu() {
        this.elements.dropdownMenu.style.display = 'none';
    }

    // Modal functionality
    showModal(modalType) {
        const modal = document.getElementById(`${modalType}-modal`);
        if (modal) {
            modal.style.display = 'flex';
            modal.style.opacity = '0';
            requestAnimationFrame(() => {
                modal.style.transition = 'opacity 0.3s ease';
                modal.style.opacity = '1';
            });
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    }

    // Settings functionality
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('chatbot-settings') || '{}');
        
        // Apply theme
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }
        
        // Apply other settings
        if (settings.sendOnEnter !== undefined) {
            const checkbox = document.getElementById('send-on-enter');
            if (checkbox) checkbox.checked = settings.sendOnEnter;
        }
        
        if (settings.soundEffects !== undefined) {
            const checkbox = document.getElementById('sound-effects');
            if (checkbox) checkbox.checked = settings.soundEffects;
        }
        
        if (settings.messageTimestamps !== undefined) {
            const checkbox = document.getElementById('message-timestamps');
            if (checkbox) checkbox.checked = settings.messageTimestamps;
        }
        
        if (settings.autoScroll !== undefined) {
            const checkbox = document.getElementById('auto-scroll');
            if (checkbox) checkbox.checked = settings.autoScroll;
        }
        
        if (settings.fontSize) {
            const slider = document.getElementById('font-size');
            if (slider) {
                slider.value = settings.fontSize;
                document.documentElement.style.setProperty('--chat-font-size', settings.fontSize + 'px');
            }
        }
        
        if (settings.animationSpeed) {
            const select = document.getElementById('animation-speed');
            if (select) select.value = settings.animationSpeed;
        }
        
        // Apply theme radio button
        if (settings.theme) {
            const radio = document.getElementById(`theme-${settings.theme}`);
            if (radio) radio.checked = true;
        }
    }

    saveSettings() {
        const themeRadio = document.querySelector('input[name="theme"]:checked');
        const settings = {
            theme: themeRadio ? themeRadio.value : 'auto',
            sendOnEnter: document.getElementById('send-on-enter')?.checked || true,
            soundEffects: document.getElementById('sound-effects')?.checked || false,
            messageTimestamps: document.getElementById('message-timestamps')?.checked || false,
            autoScroll: document.getElementById('auto-scroll')?.checked || true,
            fontSize: document.getElementById('font-size')?.value || '14',
            animationSpeed: document.getElementById('animation-speed')?.value || 'normal'
        };
        
        localStorage.setItem('chatbot-settings', JSON.stringify(settings));
        
        // Apply theme change immediately
        document.documentElement.setAttribute('data-theme', settings.theme);
        
        // Apply font size change immediately
        document.documentElement.style.setProperty('--chat-font-size', settings.fontSize + 'px');
        
        this.hideAllModals();
        this.showMessage('Settings saved successfully!', 'system');
    }

    resetSettings() {
        localStorage.removeItem('chatbot-settings');
        
        // Reset to defaults
        document.documentElement.setAttribute('data-theme', 'auto');
        document.documentElement.style.setProperty('--chat-font-size', '14px');
        
        // Reset form values
        const autoRadio = document.getElementById('theme-auto');
        if (autoRadio) autoRadio.checked = true;
        
        const sendOnEnter = document.getElementById('send-on-enter');
        if (sendOnEnter) sendOnEnter.checked = true;
        
        const soundEffects = document.getElementById('sound-effects');
        if (soundEffects) soundEffects.checked = false;
        
        const timestamps = document.getElementById('message-timestamps');
        if (timestamps) timestamps.checked = false;
        
        const autoScroll = document.getElementById('auto-scroll');
        if (autoScroll) autoScroll.checked = true;
        
        const fontSize = document.getElementById('font-size');
        if (fontSize) fontSize.value = '14';
        
        const animSpeed = document.getElementById('animation-speed');
        if (animSpeed) animSpeed.value = 'normal';
        
        this.showMessage('Settings reset to defaults!', 'system');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'auto';
        let newTheme;
        
        switch(currentTheme) {
            case 'auto':
                newTheme = 'light';
                break;
            case 'light':
                newTheme = 'dark';
                break;
            case 'dark':
                newTheme = 'auto';
                break;
            default:
                newTheme = 'auto';
        }
        
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update settings if modal is open
        const themeRadio = document.getElementById(`theme-${newTheme}`);
        if (themeRadio) {
            themeRadio.checked = true;
        }
        
        // Save theme preference
        const settings = JSON.parse(localStorage.getItem('chatbot-settings') || '{}');
        settings.theme = newTheme;
        localStorage.setItem('chatbot-settings', JSON.stringify(settings));
    }

    showFeedbackForm() {
        // Open feedback form (could be external link or modal)
        window.open('mailto:support@example.com?subject=AI Chatbot Feedback', '_blank');
    }

    showMessage(text, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message system-message`;
        messageDiv.innerHTML = `
            <div class="message-wrapper">
                <div class="message-content">${text}</div>
            </div>
        `;
        
        this.elements.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Auto-remove system messages after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                gsap.to(messageDiv, {
                    duration: 0.3,
                    opacity: 0,
                    height: 0,
                    marginBottom: 0,
                    ease: 'power2.out',
                    onComplete: () => {
                        if (messageDiv.parentNode) {
                            messageDiv.parentNode.removeChild(messageDiv);
                        }
                    }
                });
            }
        }, 3000);
    }
}

// Initialize the chatbot when DOM is loaded
console.log('Script loaded, waiting for DOM...');

// Force hide loading screen immediately
const forceHideLoading = () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        console.log('Force hiding loading screen from main script');
        loadingScreen.style.display = 'none';
        loadingScreen.style.opacity = '0';
    }
};

// Try to hide loading screen immediately
forceHideLoading();

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ChatBot...');
    forceHideLoading(); // Hide loading screen again just to be sure
    
    try {
        new ChatBot();
    } catch (error) {
        console.error('Error initializing ChatBot:', error);
        forceHideLoading(); // Hide loading screen even if there's an error
    }
});
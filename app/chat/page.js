// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { useSocket } from '@/hooks/useSocket';
// import './chat.css';

// export default function ChatPage() {
//   const [userName, setUserName] = useState('');
//   const [message, setMessage] = useState('');
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [typingIndicator, setTypingIndicator] = useState(false);
//   const [isMinimized, setIsMinimized] = useState(true);
//   const [isWidgetOpen, setIsWidgetOpen] = useState(false);
//   const messagesEndRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const isTypingRef = useRef(false);

//   const { 
//     isConnected, 
//     messages, 
//     currentUser, 
//     joinChat, 
//     sendMessage, 
//     sendTyping 
//   } = useSocket();

//   // Generate unique user ID
//   const generateUserId = () => {
//     return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
//   };

//   const handleJoin = () => {
//     const name = userName.trim() || 'User_' + Math.random().toString(36).substr(2, 5);
//     let userId = localStorage.getItem('chat-userId');
//     if (!userId) {
//       userId = generateUserId();
//       localStorage.setItem('chat-userId', userId);
//     }
//     setUserName(name);
//     setIsLoggedIn(true);
//     console.log('👤 User joining chat:', { userId, name, type: 'user' });
//     joinChat(userId, name, 'user');
//   };

//   const handleSend = () => {
//     if (!message.trim()) return;
    
//     console.log('📤 Sending message:', message);
//     sendMessage(message);
//     setMessage('');
//     setTypingIndicator(false);
    
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }
//     isTypingRef.current = false;
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSend();
//     } else {
//       handleTyping();
//     }
//   };

//   const handleTyping = () => {
//     if (!isTypingRef.current) {
//       isTypingRef.current = true;
//       sendTyping(true);
//     }

//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     typingTimeoutRef.current = setTimeout(() => {
//       sendTyping(false);
//       isTypingRef.current = false;
//     }, 1000);
//   };

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString('en-US', { 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     });
//   };

//   const toggleWidget = () => {
//     if (!isLoggedIn && !isWidgetOpen) {
//       setIsWidgetOpen(true);
//     } else if (isLoggedIn) {
//       setIsWidgetOpen(!isWidgetOpen);
//     } else {
//       setIsWidgetOpen(!isWidgetOpen);
//     }
//   };

//   const closeWidget = () => {
//     setIsWidgetOpen(false);
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Debug: Log messages when they change
//   useEffect(() => {
//     console.log('📊 User view - Total messages:', messages.length);
//   }, [messages]);

//   return (
//     <>
//       {/* Floating Chat Button */}
//       <button 
//         className="floating-chat-button" 
//         onClick={toggleWidget}
//         aria-label="Open chat"
//       >
//         {isWidgetOpen ? '✕' : '💬'}
//       </button>

//       {/* Chat Widget Modal */}
//       {isWidgetOpen && (
//         <div className={`chat-widget ${isWidgetOpen ? 'chat-widget-open' : 'chat-widget-minimized'}`}>
//           {!isLoggedIn ? (
//             <>
//               <div className="chat-header">
//                 <h2>💬 Live Chat Support</h2>
//                 <button className="close-widget-btn" onClick={closeWidget}>✕</button>
//               </div>
//               <div className="login-form">
//                 <h3>Welcome! 👋</h3>
//                 <p style={{ color: '#718096', marginBottom: '20px', fontSize: '14px' }}>
//                   Start a conversation with our support team
//                 </p>
//                 <input
//                   type="text"
//                   className="login-input"
//                   placeholder="Enter your name"
//                   value={userName}
//                   onChange={(e) => setUserName(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
//                   maxLength={50}
//                 />
//                 <button className="login-button" onClick={handleJoin}>
//                   Start Chat
//                 </button>
//               </div>
//             </>
//           ) : (
//             <>
//               <div className="chat-header">
//                 <div>
//                   <h2>💬 Live Support</h2>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
//                     <span className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></span>
//                     <span style={{ fontSize: '13px', opacity: 0.9 }}>
//                       {isConnected ? 'We\'re online' : 'Connecting...'}
//                     </span>
//                   </div>
//                 </div>
//                 <button className="close-widget-btn" onClick={closeWidget}>✕</button>
//               </div>

//               <div className="chat-messages" id="messagesContainer">
//                 {messages.map((msg, index) => (
//                   <div
//                     key={`${msg.id || index}-${msg.timestamp}`}
//                     className={`message ${msg.userType === 'user' ? 'user-message' : 'support-message'}`}
//                   >
//                     <div className="message-bubble">{msg.message}</div>
//                     <div className="message-info">
//                       {msg.userName} • {formatTime(msg.timestamp)}
//                     </div>
//                   </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//               </div>

//               {typingIndicator && (
//                 <div className="typing-indicator">Support is typing...</div>
//               )}

//               <div className="chat-input-container">
//                 <div className="chat-input-wrapper">
//                   <input
//                     type="text"
//                     className="chat-input"
//                     placeholder="Type your message..."
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                   />
//                   <button className="send-button" onClick={handleSend}>
//                     ➤
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </>
//   );
// }
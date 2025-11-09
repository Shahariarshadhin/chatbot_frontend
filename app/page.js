'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import './chat/chat.css';
import ChatPage from './chat/page';


export default function Home() {
  const router = useRouter();
  const [userType, setUserType] = useState(null);
  const messagesEndRef = useRef(null);


  const { 
    messages, 
  } = useSocket();

  useEffect(() => {
    const type = localStorage.getItem('userType');
    setUserType(type);
  }, []);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative'
      }}>
        {userType === 'admin' && (
          <button
            onClick={() => router.push('/admin')}
            style={{
              padding: '20px 40px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '16px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: '700',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              letterSpacing: '-0.5px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            }}
          >
            👨‍💼 Admin Panel
          </button>
        )}

        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '16px', fontWeight: '800', letterSpacing: '-1px' }}>
            Welcome! 👋
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px' }}>
            Need help? Chat with us!
          </p>
        </div>
      </div>

      <ChatPage/>
    </>
  );
}
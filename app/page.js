'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const type = localStorage.getItem('userType');
    setUserType(type);
  }, []);

  const openChat = () => {
    router.push('/chat');
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      gap: '20px'
    }}>
      {userType === 'admin' && (
        <button
          onClick={() => router.push('/admin')}
          style={{
            padding: '20px 40px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          }}
        >
          👨‍💼 Admin Panel
        </button>
      )}
      
      {/* Floating Chat Button */}
      <button
        className="floating-chat-button"
        onClick={openChat}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: '2147483000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px) scale(1.05)';
          e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.16)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)';
        }}
      >
        💬
      </button>
    </div>
  );
}


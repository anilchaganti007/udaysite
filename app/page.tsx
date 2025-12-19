'use client'

import { useEffect, useState } from 'react'
import './page.css'

export default function Home() {
  const [showContent, setShowContent] = useState(false)
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([])

  useEffect(() => {
    // Trigger animations after component mounts
    setShowContent(true)
    
    // Generate confetti particles
    const confettiArray = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    }))
    setConfetti(confettiArray)
  }, [])

  return (
    <main className="main-container">
      {/* Small Floating Shrek Images */}
      <div className="floating-shreks">
        <div className="floating-shrek float1">
          <img 
            src="/shrek/image1.jpg" 
            alt="Shrek" 
            className="floating-img"
            loading="lazy"
            onError={(e) => {
              console.error('Image failed to load, using emoji fallback');
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<div style="font-size: 60px; animation: floatAround 10s ease-in-out infinite;">🟢</div>';
              }
            }}
            onLoad={() => console.log('Floating Shrek image loaded')}
          />
        </div>
        <div className="floating-shrek float2">
          <img 
            src="/shrek/image2.jpg" 
            alt="Shrek" 
            className="floating-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<div style="font-size: 50px;">🟢</div>';
              }
            }}
          />
        </div>
        <div className="floating-shrek float3">
          <img 
            src="/shrek/image3.jpg" 
            alt="Shrek" 
            className="floating-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<div style="font-size: 50px;">🟢</div>';
              }
            }}
          />
        </div>
        <div className="floating-shrek float4">
          <img 
            src="/shrek/image4.jpg" 
            alt="Shrek" 
            className="floating-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<div style="font-size: 50px;">🟢</div>';
              }
            }}
          />
        </div>
        <div className="floating-shrek float5">
          <img 
            src="/shrek/image5.jpg" 
            alt="Shrek" 
            className="floating-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<div style="font-size: 50px;">🟢</div>';
              }
            }}
          />
        </div>
        <div className="floating-shrek float6">
          <img 
            src="/shrek/image6.jpg" 
            alt="Shrek" 
            className="floating-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<div style="font-size: 50px;">🟢</div>';
              }
            }}
          />
        </div>
      </div>

      {/* Confetti Animation */}
      <div className="confetti-container">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="confetti"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Balloons */}
      <div className="balloons">
        <div className="balloon balloon1">🎈</div>
        <div className="balloon balloon2">🎈</div>
        <div className="balloon balloon3">🎈</div>
        <div className="balloon balloon4">🎈</div>
        <div className="balloon balloon5">🎈</div>
        <div className="balloon balloon6">🎈</div>
      </div>

      {/* Shrek Characters Animation */}
      <div className="shrek-characters">
        <div className="shrek-character shrek1">
          <img 
            src="/shrek/image1.jpg" 
            alt="Shrek" 
            className="shrek-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '🟢';
                e.currentTarget.parentElement.style.fontSize = '50px';
              }
            }}
          />
        </div>
        <div className="shrek-character shrek2">
          <img 
            src="/shrek/image2.jpg" 
            alt="Shrek" 
            className="shrek-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '🟢';
                e.currentTarget.parentElement.style.fontSize = '50px';
              }
            }}
          />
        </div>
        <div className="shrek-character donkey1">
          <img 
            src="/shrek/image3.jpg" 
            alt="Shrek" 
            className="shrek-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '🟢';
                e.currentTarget.parentElement.style.fontSize = '45px';
              }
            }}
          />
        </div>
        <div className="shrek-character donkey2">
          <img 
            src="/shrek/image4.jpg" 
            alt="Shrek" 
            className="shrek-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '🟢';
                e.currentTarget.parentElement.style.fontSize = '45px';
              }
            }}
          />
        </div>
        <div className="shrek-character puss1">
          <img 
            src="/shrek/image5.jpg" 
            alt="Shrek" 
            className="shrek-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '🟢';
                e.currentTarget.parentElement.style.fontSize = '40px';
              }
            }}
          />
        </div>
        <div className="shrek-character puss2">
          <img 
            src="/shrek/image6.jpg" 
            alt="Shrek" 
            className="shrek-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '🟢';
                e.currentTarget.parentElement.style.fontSize = '40px';
              }
            }}
          />
        </div>
        <div className="shrek-character fiona1">
          <img 
            src="/shrek/image1.jpg" 
            alt="Shrek" 
            className="shrek-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '🟢';
                e.currentTarget.parentElement.style.fontSize = '45px';
              }
            }}
          />
        </div>
        <div className="shrek-character fiona2">
          <img 
            src="/shrek/image2.jpg" 
            alt="Shrek" 
            className="shrek-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '🟢';
                e.currentTarget.parentElement.style.fontSize = '45px';
              }
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="content">
        <h1 className="title">
          <span className="letter">H</span>
          <span className="letter">a</span>
          <span className="letter">p</span>
          <span className="letter">p</span>
          <span className="letter">y</span>
          <span className="space"></span>
          <span className="letter">B</span>
          <span className="letter">i</span>
          <span className="letter">r</span>
          <span className="letter">t</span>
          <span className="letter">h</span>
          <span className="letter">d</span>
          <span className="letter">a</span>
          <span className="letter">y</span>
          <span className="emoji">🎉</span>
        </h1>
        
        <div className="message-container">
          <p className="message highlight">Happy Birthday! 🎉</p>
          <p className="message shrek-quote">&quot;What are you doing in my swamp?&quot; - Celebrating your birthday! 🎂</p>
          <p className="message">All the very best for your business career! 💼</p>
          <p className="message highlight">I wish you achieve and grow this to the next level! 🚀</p>
          <p className="message funny shrek-quote">&quot;Ogres are like onions... layers!&quot; Just like your success! 🧅</p>
          <p className="message funny">May your business grow faster than your age! 📈</p>
          <p className="message funny">Here&apos;s to making it rain... success! 💰</p>
          <p className="message shrek-quote">&quot;This is the part where you run away!&quot; - From failures, straight to success! 🏃</p>
          <p className="message">Keep leveling up, both in life and business! 🎯</p>
          <p className="message highlight shrek-quote">May your year be as legendary as Shrek&apos;s adventures! 🟢</p>
        </div>

        <div className="cake-container">
          <div className="cake">
            <div className="candle">
              <div className="flame"></div>
            </div>
            <div className="frosting"></div>
            <div className="frosting-middle"></div>
            <div className="cake-base"></div>
          </div>
        </div>

        <div className="sparkles">
          <span className="sparkle">✨</span>
          <span className="sparkle">⭐</span>
          <span className="sparkle">💫</span>
          <span className="sparkle">✨</span>
          <span className="sparkle">⭐</span>
          <span className="sparkle">💫</span>
        </div>
      </div>
    </main>
  )
}


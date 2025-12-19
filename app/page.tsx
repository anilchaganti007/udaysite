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

      {/* Main Content */}
      <div className={`content ${showContent ? 'show' : ''}`}>
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
          <p className="message">All the very best for your business career! 💼</p>
          <p className="message highlight">I wish you achieve and grow this to the next level! 🚀</p>
          <p className="message funny">May your business grow faster than your age! 📈</p>
          <p className="message funny">Here's to making it rain... success! 💰</p>
          <p className="message">Keep leveling up, both in life and business! 🎯</p>
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


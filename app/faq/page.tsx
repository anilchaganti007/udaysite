'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'What products do you offer?',
    answer: 'We offer a main product line with various capacities and variants, as well as spare parts and accessories.',
  },
  {
    question: 'How can I place an order?',
    answer: 'You can browse our products and click "Enquire Now" to submit an enquiry. Our team will contact you to complete the order process.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods. Once you place an order, our team will share a payment link with you.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Shipping times vary depending on your location and product availability. Our team will provide you with an estimated delivery date when you place your order.',
  },
  {
    question: 'Can I track my order?',
    answer: 'Yes, you can view your order status in the "My Orders" section after logging in.',
  },
  {
    question: 'What if I have a complaint or issue?',
    answer: 'You can submit a complaint through our Support page. Please make sure to have your order number ready.',
  },
  {
    question: 'Do you offer warranty?',
    answer: 'Yes, our products come with warranty. Please contact our support team for warranty-related queries.',
  },
  {
    question: 'How can I contact customer support?',
    answer: 'You can reach out through our Support page or submit an enquiry form. Our team will respond to you promptly.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>Frequently Asked Questions</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              style={{
                width: '100%',
                padding: '1rem',
                background: openIndex === index ? '#667eea' : '#f5f5f5',
                color: openIndex === index ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{faq.question}</span>
              <span>{openIndex === index ? '−' : '+'}</span>
            </button>
            {openIndex === index && (
              <div style={{
                padding: '1rem',
                background: 'white',
                color: '#666',
                lineHeight: '1.6',
              }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { NUOMA_REKLAMA_STRINGS as S } from '@/lib/strings'
import { trackEvent } from '@/lib/analytics'

export function NuomaReklamaForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent('Patalpų nuoma / reklama — užklausa')
    const body = encodeURIComponent(
      `Vardas: ${name}\nEl. paštas: ${email}\n\nŽinutė:\n${message}`,
    )
    window.location.href = `mailto:${S.contactEmail}?subject=${subject}&body=${body}`
    trackEvent('generate_lead', { form_name: 'nuoma_reklama' })
    setSubmitted(true)
  }

  return (
    <div className="flex-1 bg-[#eeeeee] rounded-[20px] lg:rounded-[24px] p-6 lg:p-8 w-full">
      {submitted ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-black text-[15px] lg:text-[18px] font-medium leading-[24px] text-center">
            {S.successMessage}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Name */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <label className="text-black text-[15px] lg:text-[16px] leading-[24px]">
              {S.labelName}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={S.placeholderName}
              required
              className="bg-[#e0e0e0] h-12 px-6 rounded-[8px] text-[15px] lg:text-[16px] leading-[24px] text-black placeholder:text-[#575757] outline-none focus:ring-2 focus:ring-black/20 transition-shadow duration-150 w-full"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <label className="text-black text-[15px] lg:text-[16px] leading-[24px]">
              {S.labelEmail}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={S.placeholderEmail}
              required
              className="bg-[#e0e0e0] h-12 px-6 rounded-[8px] text-[15px] lg:text-[16px] leading-[24px] text-black placeholder:text-[#575757] outline-none focus:ring-2 focus:ring-black/20 transition-shadow duration-150 w-full"
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <label className="text-black text-[15px] lg:text-[16px] leading-[24px]">
              {S.labelMessage}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={S.placeholderMessage}
              required
              rows={7}
              className="bg-[#e0e0e0] px-6 py-3 rounded-[8px] text-[15px] lg:text-[16px] leading-[24px] text-black placeholder:text-[#575757] outline-none focus:ring-2 focus:ring-black/20 transition-shadow duration-150 w-full resize-none"
            />
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="bg-black text-white rounded-full px-7 py-4 text-[16px] lg:text-[18px] leading-[24px] font-normal transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
            >
              {S.submitButton}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

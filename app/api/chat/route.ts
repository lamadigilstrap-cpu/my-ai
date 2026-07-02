import {
  consumeStream,
  convertToModelMessages,
  streamText,
  stepCountIs,
  UIMessage,
  tool,
} from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

export const maxDuration = 30

// Resolve the chat model based on available credentials.
// - If an OpenRouter key (sk-or-...) is present, use OpenRouter via the
//   OpenAI-compatible chat-completions endpoint.
// - If a standard OpenAI key is present, use OpenAI directly.
// - Otherwise fall back to the Vercel AI Gateway (requires a verified card).
function getModel() {
  const key = process.env.OPENAI_API_KEY

  if (key && key.startsWith('sk-or-')) {
    const openrouter = createOpenAI({
      apiKey: key,
      baseURL: 'https://openrouter.ai/api/v1',
    })
    // Use the chat-completions endpoint (OpenRouter compatible)
    return openrouter.chat('openai/gpt-4o')
  }

  if (key) {
    const openai = createOpenAI({ apiKey: key })
    return openai('gpt-4o')
  }

  // Vercel AI Gateway (zero-config model string)
  return 'openai/gpt-5'
}

// Define tools for business operations
const operationsTools = {
  checkAvailability: tool({
    description: 'Check availability for appointments or reservations',
    inputSchema: z.object({
      businessType: z.enum(['restaurant', 'retail', 'salon']),
      date: z.string().describe('Date in YYYY-MM-DD format'),
      time: z.string().optional().describe('Preferred time'),
      partySize: z.number().optional().describe('Number of people'),
      service: z.string().optional().describe('Type of service requested'),
    }),
    execute: async ({ businessType, date, time, partySize, service }) => {
      // Simulated availability check
      const available = Math.random() > 0.3
      const slots = ['9:00 AM', '10:30 AM', '1:00 PM', '3:30 PM', '5:00 PM']
      return {
        available,
        date,
        requestedTime: time,
        businessType,
        availableSlots: available ? slots.slice(0, 3) : slots,
        service: service || 'General',
        partySize: partySize || 1,
      }
    },
  }),

  makeReservation: tool({
    description: 'Make a reservation or book an appointment',
    inputSchema: z.object({
      businessType: z.enum(['restaurant', 'retail', 'salon']),
      customerName: z.string(),
      customerPhone: z.string(),
      date: z.string(),
      time: z.string(),
      service: z.string().optional(),
      notes: z.string().optional(),
    }),
    execute: async ({ businessType, customerName, date, time, service, notes }) => {
      // Simulated booking
      const confirmationNumber = `${businessType.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`
      return {
        success: true,
        confirmationNumber,
        customerName,
        date,
        time,
        service: service || 'Standard',
        businessType,
        notes: notes || '',
        message: `Booking confirmed for ${customerName} on ${date} at ${time}`,
      }
    },
  }),

  getBusinessHours: tool({
    description: 'Get business operating hours',
    inputSchema: z.object({
      businessType: z.enum(['restaurant', 'retail', 'salon']),
      day: z.string().optional(),
    }),
    execute: async ({ businessType, day }) => {
      const hours: Record<string, Record<string, string>> = {
        restaurant: {
          monday: '11:00 AM - 10:00 PM',
          tuesday: '11:00 AM - 10:00 PM',
          wednesday: '11:00 AM - 10:00 PM',
          thursday: '11:00 AM - 11:00 PM',
          friday: '11:00 AM - 11:00 PM',
          saturday: '10:00 AM - 11:00 PM',
          sunday: '10:00 AM - 9:00 PM',
        },
        retail: {
          monday: '9:00 AM - 8:00 PM',
          tuesday: '9:00 AM - 8:00 PM',
          wednesday: '9:00 AM - 8:00 PM',
          thursday: '9:00 AM - 9:00 PM',
          friday: '9:00 AM - 9:00 PM',
          saturday: '10:00 AM - 7:00 PM',
          sunday: '11:00 AM - 6:00 PM',
        },
        salon: {
          monday: 'Closed',
          tuesday: '9:00 AM - 7:00 PM',
          wednesday: '9:00 AM - 7:00 PM',
          thursday: '9:00 AM - 8:00 PM',
          friday: '9:00 AM - 8:00 PM',
          saturday: '9:00 AM - 6:00 PM',
          sunday: 'Closed',
        },
      }
      
      if (day) {
        return { [day.toLowerCase()]: hours[businessType][day.toLowerCase()] || 'Not available' }
      }
      return hours[businessType]
    },
  }),

  getServices: tool({
    description: 'Get available services or menu items',
    inputSchema: z.object({
      businessType: z.enum(['restaurant', 'retail', 'salon']),
      category: z.string().optional(),
    }),
    execute: async ({ businessType, category }) => {
      const services: Record<string, Record<string, unknown>> = {
        restaurant: {
          appetizers: ['Bruschetta - $12', 'Calamari - $15', 'Soup of the Day - $8'],
          mains: ['Grilled Salmon - $28', 'Ribeye Steak - $42', 'Pasta Primavera - $22'],
          desserts: ['Tiramisu - $10', 'Cheesecake - $9', 'Gelato - $7'],
        },
        retail: {
          electronics: ['Smartphones', 'Tablets', 'Accessories'],
          clothing: ['Menswear', 'Womenswear', 'Accessories'],
          home: ['Furniture', 'Decor', 'Kitchen'],
        },
        salon: {
          hair: ['Haircut - $45', 'Color - $95', 'Highlights - $120', 'Blowout - $35'],
          nails: ['Manicure - $30', 'Pedicure - $45', 'Gel Nails - $55'],
          spa: ['Facial - $85', 'Massage - $95', 'Body Treatment - $120'],
        },
      }
      
      if (category) {
        return services[businessType][category.toLowerCase()] || services[businessType]
      }
      return services[businessType]
    },
  }),

  handleInquiry: tool({
    description: 'Log and handle customer inquiries or complaints',
    inputSchema: z.object({
      type: z.enum(['question', 'complaint', 'feedback', 'other']),
      subject: z.string(),
      details: z.string(),
      customerContact: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
    }),
    execute: async ({ type, subject, details, customerContact, priority }) => {
      const ticketId = `TKT-${Date.now().toString().slice(-8)}`
      return {
        ticketId,
        type,
        subject,
        status: 'received',
        priority: priority || 'medium',
        customerContact: customerContact || 'Not provided',
        message: `Your ${type} has been logged with ticket ID: ${ticketId}. Our team will follow up shortly.`,
      }
    },
  }),
}

export async function POST(req: Request) {
  const { messages, businessType = 'restaurant' }: { messages: UIMessage[], businessType?: string } = await req.json()

  const systemPrompt = `You are LamadiAI, a professional AI operations assistant specializing in ${businessType} businesses. You help with:

- Answering phone calls and chat inquiries
- Making reservations and appointments
- Providing business information (hours, services, menu)
- Handling customer questions and concerns
- Managing scheduling and availability

Always be professional, friendly, and efficient. Speak naturally as if you're a knowledgeable staff member. When customers ask about availability or want to make bookings, use the appropriate tools to help them.

Current business type: ${businessType}

Guidelines:
- Greet customers warmly
- Ask clarifying questions when needed
- Confirm important details before finalizing bookings
- Offer alternatives if requested times are unavailable
- Handle complaints with empathy and professionalism`

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: operationsTools,
    stopWhen: stepCountIs(5),
    // Keep within limited OpenRouter free-tier credits
    maxOutputTokens: 1500,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}

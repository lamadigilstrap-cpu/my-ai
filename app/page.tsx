'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { cn } from '@/lib/utils'
import { 
  Phone, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Send, 
  Store, 
  Utensils, 
  Scissors,
  Volume2,
  VolumeX,
  PhoneCall,
  PhoneOff,
  Activity,
  Clock,
  Calendar,
  ChevronRight,
  Zap,
  TrendingUp,
  Users,
  BarChart3,
  Bot,
  Headphones,
  Shield,
  CheckCircle2,
  ArrowRight,
  Waves,
  CircleDot
} from 'lucide-react'

type BusinessType = 'restaurant' | 'retail' | 'salon'

// Voice visualization component
function VoiceVisualizer({ isActive, className }: { isActive: boolean; className?: string }) {
  const [bars, setBars] = useState<number[]>(Array(12).fill(4))
  
  useEffect(() => {
    if (!isActive) {
      setBars(Array(12).fill(4))
      return
    }
    
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 28 + 4))
    }, 80)
    
    return () => clearInterval(interval)
  }, [isActive])
  
  return (
    <div className={cn("flex items-end justify-center gap-0.5 h-8", className)}>
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full transition-all duration-100 ease-out"
          style={{ 
            height: `${height}px`,
            opacity: 0.5 + (height / 64)
          }}
        />
      ))}
    </div>
  )
}

// Status badge component
function StatusBadge({ status }: { status: 'ready' | 'streaming' | 'submitted' | 'error' }) {
  const config = {
    ready: { color: 'bg-success', label: 'System Online', ring: 'ring-success/20' },
    streaming: { color: 'bg-primary', label: 'Processing', ring: 'ring-primary/20' },
    submitted: { color: 'bg-warning', label: 'Analyzing', ring: 'ring-warning/20' },
    error: { color: 'bg-destructive', label: 'Error', ring: 'ring-destructive/20' },
  }
  
  const { color, label, ring } = config[status]
  
  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full glass-card", ring, "ring-1")}>
      <span className="relative flex h-2 w-2">
        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)} />
        <span className={cn("relative inline-flex rounded-full h-2 w-2", color)} />
      </span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

// Business type selector
function BusinessTypeSelector({ 
  selected, 
  onChange 
}: { 
  selected: BusinessType
  onChange: (type: BusinessType) => void 
}) {
  const options = [
    { type: 'restaurant' as const, icon: Utensils, label: 'Restaurant', desc: 'Reservations & orders' },
    { type: 'retail' as const, icon: Store, label: 'Retail', desc: 'Inventory & sales' },
    { type: 'salon' as const, icon: Scissors, label: 'Salon', desc: 'Appointments & services' },
  ]
  
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map(({ type, icon: Icon, label, desc }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            "relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300",
            selected === type 
              ? "bg-primary/10 border-primary/50 glow-sm" 
              : "bg-secondary/30 border-border hover:border-primary/30 hover:bg-secondary/50"
          )}
        >
          {selected === type && (
            <div className="absolute top-2 right-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
          )}
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
            selected === type ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className={cn(
              "text-sm font-semibold transition-colors",
              selected === type ? "text-foreground" : "text-muted-foreground"
            )}>{label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

// Phone call interface
function PhoneInterface({ 
  isActive,
  onToggle,
  isMuted,
  onToggleMute,
  isSpeakerOn,
  onToggleSpeaker
}: { 
  isActive: boolean
  onToggle: () => void
  isMuted: boolean
  onToggleMute: () => void
  isSpeakerOn: boolean
  onToggleSpeaker: () => void
}) {
  const [duration, setDuration] = useState(0)
  
  useEffect(() => {
    if (!isActive) {
      setDuration(0)
      return
    }
    const interval = setInterval(() => setDuration(d => d + 1), 1000)
    return () => clearInterval(interval)
  }, [isActive])
  
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }
  
  return (
    <div className={cn(
      "glass-elevated rounded-2xl p-5 transition-all duration-500",
      isActive && "glow-sm"
    )}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300",
            isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
          )}>
            {isActive ? <Headphones className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {isActive ? 'Call Active' : 'Phone Line'}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {isActive ? formatTime(duration) : '+1 (800) LAMADI-1'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onToggle}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
            isActive 
              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
              : "bg-success hover:bg-success/90 text-success-foreground glow-sm"
          )}
        >
          {isActive ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
        </button>
      </div>
      
      {isActive && (
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-center py-2">
            <VoiceVisualizer isActive={!isMuted || isSpeakerOn} />
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onToggleMute}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
                !isMuted ? "bg-primary/15 text-primary" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {!isMuted ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              <span className="text-[10px] font-medium">{!isMuted ? 'Mic On' : 'Muted'}</span>
            </button>
            
            <button
              onClick={onToggleSpeaker}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
                isSpeakerOn ? "bg-primary/15 text-primary" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <span className="text-[10px] font-medium">{isSpeakerOn ? 'Speaker' : 'Silent'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Analytics dashboard
function AnalyticsDashboard() {
  const metrics = [
    { icon: PhoneCall, label: 'Calls Handled', value: '1,247', change: '+12.5%', positive: true },
    { icon: MessageSquare, label: 'Messages', value: '3,891', change: '+8.2%', positive: true },
    { icon: Calendar, label: 'Bookings', value: '428', change: '+15.7%', positive: true },
    { icon: Clock, label: 'Avg. Response', value: '0.8s', change: '-18%', positive: true },
  ]
  
  return (
    <div className="space-y-3">
      {metrics.map(({ icon: Icon, label, value, change, positive }) => (
        <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          </div>
          <span className={cn(
            "text-xs font-mono font-medium px-2 py-0.5 rounded-full",
            positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
          )}>
            {change}
          </span>
        </div>
      ))}
    </div>
  )
}

// Chat message component
function ChatMessage({ message }: { 
  message: { 
    id: string
    role: string
    parts: Array<{ type: string; text?: string; toolName?: string; state?: string }> 
  } 
}) {
  const isUser = message.role === 'user'
  
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
        isUser ? "bg-secondary" : "bg-primary/15"
      )}>
        {isUser ? (
          <Users className="w-4 h-4 text-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>
      <div className={cn(
        "max-w-[80%] rounded-xl px-4 py-2.5",
        isUser ? "bg-secondary" : "glass-card"
      )}>
        {message.parts.map((part, idx) => {
          if (part.type === 'text' && part.text) {
            return (
              <p key={idx} className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {part.text}
              </p>
            )
          }
          if (part.type === 'tool-invocation') {
            return (
              <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-2.5 py-1.5 mt-2">
                <Activity className={cn("w-3 h-3", part.state !== 'output-available' && "animate-pulse")} />
                <span>{part.state === 'output-available' ? 'Completed:' : 'Running:'} {part.toolName}</span>
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

// Quick action chips
function QuickActions({ onAction, disabled }: { onAction: (text: string) => void; disabled: boolean }) {
  const actions = [
    { label: 'Check availability', prompt: "What's the availability for today?" },
    { label: 'Business hours', prompt: "What are your business hours?" },
    { label: 'Services', prompt: "Tell me about your services and pricing" },
    { label: 'Book now', prompt: "I'd like to make a reservation" },
  ]
  
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ label, prompt }) => (
        <button
          key={label}
          onClick={() => onAction(prompt)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary/50 text-muted-foreground rounded-full border border-border hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {label}
          <ChevronRight className="w-3 h-3" />
        </button>
      ))}
    </div>
  )
}

// Features grid for empty state
function FeaturesGrid({ onStart }: { onStart: (text: string) => void }) {
  const features = [
    { 
      icon: Phone, 
      title: 'Voice Calls', 
      desc: 'Handle incoming calls with natural conversation',
      action: 'Simulate a customer calling about business hours'
    },
    { 
      icon: Calendar, 
      title: 'Reservations', 
      desc: 'Manage bookings and appointments seamlessly',
      action: "I'd like to book an appointment for tomorrow at 2pm"
    },
    { 
      icon: MessageSquare, 
      title: 'Live Chat', 
      desc: 'Answer customer questions instantly',
      action: 'What services do you offer and what are your prices?'
    },
    { 
      icon: BarChart3, 
      title: 'Analytics', 
      desc: 'Track performance metrics in real-time',
      action: 'Give me a summary of today\'s operations'
    },
  ]
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {features.map(({ icon: Icon, title, desc, action }) => (
        <button
          key={title}
          onClick={() => onStart(action)}
          className="group p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
        </button>
      ))}
    </div>
  )
}

// Main component
export default function AIOperationsAssistant() {
  const [businessType, setBusinessType] = useState<BusinessType>('restaurant')
  const [input, setInput] = useState('')
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
      body: { businessType },
    }),
  })
  
  const isProcessing = status === 'streaming' || status === 'submitted'
  
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return
    sendMessage({ text: input })
    setInput('')
  }, [input, isProcessing, sendMessage])
  
  const handleQuickAction = useCallback((text: string) => {
    if (isProcessing) return
    sendMessage({ text })
  }, [isProcessing, sendMessage])
  
  const handleBusinessChange = useCallback((type: BusinessType) => {
    setBusinessType(type)
    setMessages([])
  }, [setMessages])
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-elevated border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  Lamadi<span className="text-primary">AI</span>
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Operations Assistant
                </p>
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-4">
              <StatusBadge status={status} />
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Enterprise</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar */}
          <aside className="lg:col-span-3 space-y-5">
            {/* Business Type */}
            <div className="glass-elevated rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CircleDot className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Business Mode
                </h2>
              </div>
              <BusinessTypeSelector selected={businessType} onChange={handleBusinessChange} />
            </div>
            
            {/* Phone Interface */}
            <PhoneInterface
              isActive={isCallActive}
              onToggle={() => setIsCallActive(!isCallActive)}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              isSpeakerOn={isSpeakerOn}
              onToggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
            />
            
            {/* Analytics */}
            <div className="glass-elevated rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Analytics
                  </h2>
                </div>
                <span className="text-[10px] text-muted-foreground">Last 30d</span>
              </div>
              <AnalyticsDashboard />
            </div>
          </aside>
          
          {/* Chat Panel */}
          <div className="lg:col-span-9">
            <div className="glass-elevated rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-9rem)]">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Waves className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Live Conversation</h2>
                    <p className="text-[10px] text-muted-foreground">AI-powered customer interaction</p>
                  </div>
                </div>
                <QuickActions onAction={handleQuickAction} disabled={isProcessing} />
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 float">
                      <Bot className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Welcome to LamadiAI
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                      Your intelligent operations assistant for {businessType} businesses.
                      Start a conversation below or try one of these quick actions.
                    </p>
                    <FeaturesGrid onStart={handleQuickAction} />
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    {isProcessing && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary animate-pulse" />
                        </div>
                        <div className="glass-card rounded-xl px-4 py-3">
                          <div className="flex items-center gap-2 typing-dots">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
              
              {/* Input Area */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !input.trim()}
                    className={cn(
                      "px-5 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2",
                      input.trim() && !isProcessing
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-sm"
                        : "bg-secondary text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-3">
                  LamadiAI is designed to assist with business operations. Always verify important information.
                </p>
              </form>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}

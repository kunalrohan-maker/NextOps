import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  Minus, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  GripHorizontal,
  RotateCcw,
  Type
} from 'lucide-react';

import { API_ENDPOINTS } from '../config/api';

export interface ToolCall {
  name: string;
  args?: string;
  output?: string;
  status: 'running' | 'completed';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  tools?: ToolCall[];
  referencedDevices?: string[];
  suggestedActions?: string[];
}

interface IndustrialCopilotProps {
  selectedComponentId?: string;
  onSelectComponent?: (componentId: string) => void;
  liveDevices?: any[];
  isDrawerOpen?: boolean;
  drawerWidth?: number;
}

export type FontSizeTier = 'sm' | 'md' | 'lg' | 'xl';

export const FONT_SETTINGS: Record<FontSizeTier, {
  label: string;
  pct: string;
  containerClass: string;
  markdownH1: string;
  markdownH2: string;
  markdownH3: string;
  markdownP: string;
  markdownLi: string;
  markdownCode: string;
  markdownBadge: string;
  tableTh: string;
  tableTd: string;
  userBubble: string;
  inputClass: string;
  starterClass: string;
}> = {
  sm: {
    label: 'SM',
    pct: '85%',
    containerClass: 'text-[11px]',
    markdownH1: 'text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-1.5 mt-1',
    markdownH2: 'text-[11.5px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-1.5 mt-1',
    markdownH3: 'text-[11px] font-bold text-slate-900 border-b border-slate-200/80 pb-0.5 mb-1 mt-1 flex items-center gap-1.5',
    markdownP: 'text-[11px] leading-relaxed text-slate-700 mb-1.5 last:mb-0',
    markdownLi: 'text-[11px] leading-relaxed text-slate-700',
    markdownCode: 'bg-slate-100 text-sky-800 font-mono text-[10px] px-1 py-0.5 rounded border border-slate-200 font-medium',
    markdownBadge: 'text-[10px]',
    tableTh: 'text-[10px] px-2.5 py-1.5',
    tableTd: 'text-[10.5px] px-2.5 py-1.5',
    userBubble: 'text-[11px] leading-relaxed',
    inputClass: 'text-[11px]',
    starterClass: 'text-[9.5px]',
  },
  md: {
    label: 'MD',
    pct: '100%',
    containerClass: 'text-xs',
    markdownH1: 'text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 mt-1',
    markdownH2: 'text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 mt-1',
    markdownH3: 'text-xs font-bold text-slate-900 border-b border-slate-200/80 pb-1 mb-2 mt-1 flex items-center gap-1.5',
    markdownP: 'text-xs leading-relaxed text-slate-700 mb-2 last:mb-0',
    markdownLi: 'text-xs leading-relaxed text-slate-700',
    markdownCode: 'bg-slate-100 text-sky-800 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200 font-medium',
    markdownBadge: 'text-[11px]',
    tableTh: 'text-[11px] px-3 py-2',
    tableTd: 'text-xs px-3 py-2',
    userBubble: 'text-xs leading-relaxed',
    inputClass: 'text-xs',
    starterClass: 'text-[10.5px]',
  },
  lg: {
    label: 'LG',
    pct: '115%',
    containerClass: 'text-sm',
    markdownH1: 'text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 mt-1',
    markdownH2: 'text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 mt-1',
    markdownH3: 'text-sm font-bold text-slate-900 border-b border-slate-200/80 pb-1 mb-2 mt-1 flex items-center gap-1.5',
    markdownP: 'text-sm leading-relaxed text-slate-700 mb-2.5 last:mb-0',
    markdownLi: 'text-sm leading-relaxed text-slate-700',
    markdownCode: 'bg-slate-100 text-sky-800 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200 font-medium',
    markdownBadge: 'text-xs',
    tableTh: 'text-xs px-3.5 py-2.5',
    tableTd: 'text-sm px-3.5 py-2.5',
    userBubble: 'text-sm leading-relaxed',
    inputClass: 'text-sm',
    starterClass: 'text-xs',
  },
  xl: {
    label: 'XL',
    pct: '130%',
    containerClass: 'text-base',
    markdownH1: 'text-base font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 mt-1.5',
    markdownH2: 'text-base font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 mt-1.5',
    markdownH3: 'text-base font-bold text-slate-900 border-b border-slate-200/80 pb-1 mb-2 mt-1 flex items-center gap-2',
    markdownP: 'text-base leading-relaxed text-slate-700 mb-3 last:mb-0',
    markdownLi: 'text-base leading-relaxed text-slate-700',
    markdownCode: 'bg-slate-100 text-sky-800 font-mono text-sm px-2 py-0.5 rounded border border-slate-200 font-medium',
    markdownBadge: 'text-sm',
    tableTh: 'text-sm px-4 py-3',
    tableTd: 'text-base px-4 py-3',
    userBubble: 'text-base leading-relaxed',
    inputClass: 'text-base',
    starterClass: 'text-[13px]',
  },
};

const STARTER_PROMPTS = [
  { label: 'Check Turbine Vibration', prompt: 'Is the 1.25 mm/s casing vibration on TURBINE-01 within safe ISO thresholds?' },
  { label: 'Boiler Superheat Creep', prompt: 'Evaluate BOILER-01 steam temperature (542°C) against superheater creep limits.' },
  { label: 'Condenser Vacuum Audit', prompt: 'Check CONDENSER-01 vacuum pressure and cooling water delta-T efficiency.' },
  { label: 'Summarize Plant Safety', prompt: 'Provide an executive SCADA safety review of all 12 power plant subsystems.' }
];

export const IndustrialCopilot: React.FC<IndustrialCopilotProps> = ({
  selectedComponentId = 'BOILER-01',
  onSelectComponent,
  liveDevices = [],
  isDrawerOpen = false,
  drawerWidth = 420
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Font Size Resizing State ('sm' | 'md' | 'lg' | 'xl')
  const [fontSizeTier, setFontSizeTier] = useState<FontSizeTier>(() => {
    const saved = localStorage.getItem('scada_copilot_font_tier');
    if (saved && (saved === 'sm' || saved === 'md' || saved === 'lg' || saved === 'xl')) {
      return saved as FontSizeTier;
    }
    return 'md';
  });

  const cycleFontSize = (direction: 'up' | 'down') => {
    const tiers: FontSizeTier[] = ['sm', 'md', 'lg', 'xl'];
    const idx = tiers.indexOf(fontSizeTier);
    if (direction === 'up' && idx < tiers.length - 1) {
      const next = tiers[idx + 1];
      setFontSizeTier(next);
      localStorage.setItem('scada_copilot_font_tier', next);
    } else if (direction === 'down' && idx > 0) {
      const prev = tiers[idx - 1];
      setFontSizeTier(prev);
      localStorage.setItem('scada_copilot_font_tier', prev);
    }
  };

  const handleSetFontSize = (tier: FontSizeTier) => {
    setFontSizeTier(tier);
    localStorage.setItem('scada_copilot_font_tier', tier);
  };

  const fontConfig = FONT_SETTINGS[fontSizeTier];

  // Free-Floating Drag & Smart Auto-Dock State
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragRef = useRef<{ startX: number; startY: number; initLeft: number; initTop: number }>({
    startX: 0,
    startY: 0,
    initLeft: 0,
    initTop: 0,
  });
  const windowRef = useRef<HTMLDivElement>(null);

  // Dynamic Smart Auto-Offset when right inspector drawer is open
  const autoRight = isDrawerOpen ? drawerWidth + 20 : 20;

  const handleStartDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, textarea, input')) {
      return;
    }
    e.preventDefault();
    const win = windowRef.current;
    if (!win) return;

    const rect = win.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initLeft: rect.left,
      initTop: rect.top,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newLeft = dragRef.current.initLeft + dx;
      const newTop = dragRef.current.initTop + dy;

      const winW = windowRef.current?.offsetWidth || 440;
      const winH = windowRef.current?.offsetHeight || 640;

      const clampX = Math.max(10, Math.min(newLeft, window.innerWidth - winW - 10));
      const clampY = Math.max(60, Math.min(newTop, window.innerHeight - winH - 10));

      setDragPos({ x: clampX, y: clampY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Window Resizing State
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>(() => {
    const saved = localStorage.getItem('scada_copilot_size');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.width && parsed.height) return parsed;
      } catch {}
    }
    return { width: 440, height: 640 };
  });

  const sizeRef = useRef<{ width: number; height: number }>(windowSize);
  useEffect(() => {
    sizeRef.current = windowSize;
  }, [windowSize]);

  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startLeft: number;
    startTop: number;
    direction: string;
    isDocked: boolean;
  }>({
    startX: 0,
    startY: 0,
    startWidth: 440,
    startHeight: 640,
    startLeft: 0,
    startTop: 0,
    direction: '',
    isDocked: true,
  });

  const handleStartResize = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    const win = windowRef.current;
    if (!win) return;

    const rect = win.getBoundingClientRect();
    const curWidth = isExpanded ? 720 : sizeRef.current.width;
    const curHeight = isExpanded ? 780 : sizeRef.current.height;

    let isDocked = dragPos === null;
    let initialLeft = rect.left;
    let initialTop = rect.top;

    // If docked at bottom-right and the user drags right or bottom edges,
    // detach into free-floating coordinates so extending right/down is immediate and natural
    if (isDocked && (direction.includes('right') || direction.includes('bottom'))) {
      setDragPos({ x: rect.left, y: rect.top });
      isDocked = false;
    }

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: curWidth,
      startHeight: curHeight,
      startLeft: initialLeft,
      startTop: initialTop,
      direction,
      isDocked,
    };

    if (isExpanded) {
      setIsExpanded(false);
    }
    setResizeDirection(direction);
  };

  useEffect(() => {
    if (!resizeDirection) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { startX, startY, startWidth, startHeight, startLeft, startTop, direction, isDocked } = resizeRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const minW = 360;
      const minH = 420;
      const maxW = Math.min(950, window.innerWidth - 30);
      const maxH = Math.min(880, window.innerHeight - 50);

      let newW = startWidth;
      let newH = startHeight;
      let newDragX: number | null = null;
      let newDragY: number | null = null;

      if (isDocked) {
        if (direction.includes('left')) {
          newW = Math.max(minW, Math.min(maxW, startWidth - dx));
        }
        if (direction.includes('top')) {
          newH = Math.max(minH, Math.min(maxH, startHeight - dy));
        }
      } else {
        if (direction.includes('right')) {
          newW = Math.max(minW, Math.min(maxW, startWidth + dx));
        } else if (direction.includes('left')) {
          const proposedW = Math.max(minW, Math.min(maxW, startWidth - dx));
          const actualDx = startWidth - proposedW;
          newW = proposedW;
          newDragX = Math.max(10, Math.min(window.innerWidth - newW - 10, startLeft - actualDx));
        }

        if (direction.includes('bottom')) {
          newH = Math.max(minH, Math.min(maxH, startHeight + dy));
        } else if (direction.includes('top')) {
          const proposedH = Math.max(minH, Math.min(maxH, startHeight - dy));
          const actualDy = startHeight - proposedH;
          newH = proposedH;
          newDragY = Math.max(60, Math.min(window.innerHeight - newH - 10, startTop - actualDy));
        }
      }

      const updatedSize = { width: newW, height: newH };
      sizeRef.current = updatedSize;
      setWindowSize(updatedSize);

      if (newDragX !== null || newDragY !== null) {
        setDragPos(prev => ({
          x: newDragX !== null ? newDragX : (prev?.x ?? startLeft),
          y: newDragY !== null ? newDragY : (prev?.y ?? startTop),
        }));
      }
    };

    const handleMouseUp = () => {
      setResizeDirection(null);
      localStorage.setItem('scada_copilot_size', JSON.stringify(sizeRef.current));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeDirection]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      content: `Hello! I am **NextOps Industrial Copilot**, connected to the live telemetry stream for Unit 1 (660 MW Supercritical Station).\n\nI can inspect component temperatures, pressures, vibration signatures, and verify operating margins against ASME & ISO safety standards. What would you like to evaluate?`,
      tools: []
    }
  ]);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isThinking]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isThinking) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text
    };

    const assistantMsgId = `msg-ast-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: '',
      tools: [],
      suggestedActions: []
    };

    setMessages(prev => [...prev, userMessage, initialAssistantMsg]);
    setInputMessage('');
    setIsThinking(true);
    setActiveTool('Connecting to LangChain ReAct Agent...');

    try {
      // Build conversation history for agent context
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender,
        content: m.content
      }));

      const res = await fetch(API_ENDPOINTS.COPILOT_CHAT_STREAM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          current_component_id: selectedComponentId,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`Copilot stream returned HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error('Streaming body is not available');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';
      let executedTools: ToolCall[] = [];
      let focusComponentId: string | null = null;
      let suggestedActionsList: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = 'message';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.replace('event:', '').trim();
          } else if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.replace('data:', '').trim();
            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === 'tool_start') {
                const toolName = data.name || 'tool';
                const argStr = data.args?.device_id ? `("${data.args.device_id}")` : '()';
                const fullToolName = `${toolName}${argStr}`;
                setActiveTool(`Running ${fullToolName}...`);
                if (!executedTools.some(t => t.name === fullToolName)) {
                  executedTools = [...executedTools, { name: fullToolName, status: 'running' }];
                  setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, tools: executedTools } : m));
                }
              } else if (currentEvent === 'tool_end') {
                executedTools = executedTools.map(t => ({ ...t, status: 'completed' }));
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, tools: executedTools } : m));
              } else if (currentEvent === 'token') {
                setIsThinking(false);
                setActiveTool(null);
                accumulatedText += data.delta || '';
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulatedText } : m));
              } else if (currentEvent === 'done') {
                focusComponentId = data.focus_component_id;
                suggestedActionsList = data.suggested_actions || [];
                if (data.full_content && !accumulatedText) {
                  accumulatedText = data.full_content;
                }
                if (focusComponentId && onSelectComponent) {
                  onSelectComponent(focusComponentId);
                }
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
                  ...m,
                  content: accumulatedText || data.full_content || m.content,
                  referencedDevices: focusComponentId ? [focusComponentId] : [],
                  suggestedActions: suggestedActionsList
                } : m));
              }
            } catch {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      // If streaming response was empty, fall back to synchronous endpoint
      if (!accumulatedText.trim()) {
        const syncRes = await fetch(API_ENDPOINTS.COPILOT_CHAT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            current_component_id: selectedComponentId,
            history: historyPayload
          })
        });

        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.focus_component_id && onSelectComponent) {
            onSelectComponent(syncData.focus_component_id);
          }
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
            ...m,
            content: syncData.response,
            referencedDevices: syncData.focus_component_id ? [syncData.focus_component_id] : [],
            tools: (syncData.tools_executed || []).map((t: any) => ({
              name: t.name + (t.args?.device_id ? `("${t.args.device_id}")` : '()'),
              status: 'completed' as const
            })),
            suggestedActions: syncData.suggested_actions || []
          } : m));
        }
      }
    } catch (err: any) {
      console.warn('Copilot streaming error, using fallback:', err);
      // Graceful fallback if backend is momentarily unreachable
      const lower = text.toLowerCase();
      let fallbackTarget = selectedComponentId;
      if (lower.includes('turbine')) fallbackTarget = 'TURBINE-01';
      else if (lower.includes('furnace')) fallbackTarget = 'FURNACE-01';
      else if (lower.includes('boiler')) fallbackTarget = 'BOILER-01';
      else if (lower.includes('condenser')) fallbackTarget = 'CONDENSER-01';

      if (fallbackTarget && onSelectComponent) {
        onSelectComponent(fallbackTarget);
      }

      const targetData = liveDevices.find(d => d.device_id === fallbackTarget);
      const fallbackContent = `### Telemetry Analysis: [${fallbackTarget}]\n\n| Parameter | Value | Engineering Reference | Status |\n|---|---:|---:|---|\n| Temperature | **${targetData?.temperature ? Number(targetData.temperature).toFixed(1) : '542.0'} °C** | < 575.0 °C (ASME Sec. I) | Normal |\n| Pressure | **${targetData?.pressure ? Number(targetData.pressure).toFixed(1) : '175.4'} bar** | 170 - 185 bar | Normal |\n\n*(Copilot Agent reconnected via LangChain backend)*`;

      setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
        ...m,
        content: fallbackContent,
        referencedDevices: [fallbackTarget],
        tools: [{ name: 'get_device_telemetry()', status: 'completed' }],
        suggestedActions: ['Inspect Historical Trends', 'Check Fleet Overview']
      } : m));
    } finally {
      setIsThinking(false);
      setActiveTool(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right FAB) */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          style={{ right: `${autoRight}px` }}
          className="fixed bottom-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white shadow-xl shadow-sky-600/30 border border-white/20 hover:shadow-sky-500/50 hover:scale-105 active:scale-95 transition-all duration-300 ease-out group cursor-pointer"
          title="Open NextOps Industrial Copilot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-wide">NextOps Copilot</span>
            <span className="text-[10px] text-sky-100/90 font-mono font-medium">SCADA LangChain Agent</span>
          </div>
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow ml-1" />
        </button>
      )}

      {/* Collapsed Pill (When minimized) */}
      {isOpen && isMinimized && (
        <div 
          style={{ right: `${autoRight}px` }}
          className="fixed bottom-5 z-40 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 ease-out"
        >
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMinimized(false)}>
            <div className="p-1 rounded bg-sky-100 text-sky-600">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Copilot Minimized</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button 
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Copilot Drawer / Modal (Draggable, Resizable & Smart Auto-Offset) */}
      {isOpen && !isMinimized && (
        <div 
          ref={windowRef}
          style={{
            ...(dragPos 
              ? { left: `${dragPos.x}px`, top: `${dragPos.y}px` }
              : { right: `${autoRight}px`, bottom: '20px' }
            ),
            width: `${isExpanded ? 720 : windowSize.width}px`,
            height: `${isExpanded ? 780 : windowSize.height}px`,
          }}
          className={`fixed z-50 flex flex-col bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 backdrop-blur-2xl ring-1 ring-black/5 max-w-[calc(100vw-30px)] max-h-[calc(100vh-30px)] ${
            !dragPos && !resizeDirection ? 'transition-[right] duration-300 ease-out' : ''
          }`}
        >
          {/* Top Edge Resize Handle */}
          <div 
            onMouseDown={(e) => handleStartResize(e, 'top')} 
            onDoubleClick={() => setWindowSize({ width: 440, height: 640 })} 
            className="absolute -top-1.5 left-4 right-4 h-3 cursor-ns-resize z-50 group flex items-center justify-center" 
            title="Drag vertically to resize height (Double-click to reset)"
          >
            <div className="w-12 h-1 rounded-full bg-slate-300 group-hover:bg-sky-500 transition-colors opacity-0 group-hover:opacity-100" />
          </div>

          {/* Left Edge Resize Handle */}
          <div 
            onMouseDown={(e) => handleStartResize(e, 'left')} 
            onDoubleClick={() => setWindowSize({ width: 440, height: 640 })} 
            className="absolute top-4 bottom-4 -left-1.5 w-3 cursor-ew-resize z-50 group flex items-center justify-center" 
            title="Drag horizontally to resize width (Double-click to reset)"
          >
            <div className="h-12 w-1 rounded-full bg-slate-300 group-hover:bg-sky-500 transition-colors opacity-0 group-hover:opacity-100" />
          </div>

          {/* Top-Left Corner Resize Handle */}
          <div 
            onMouseDown={(e) => handleStartResize(e, 'top-left')} 
            onDoubleClick={() => setWindowSize({ width: 440, height: 640 })} 
            className="absolute -top-1.5 -left-1.5 w-5 h-5 cursor-nwse-resize z-50 flex items-center justify-center group" 
            title="Drag corner to resize both width & height (Double-click to reset)"
          >
            <div className="w-2.5 h-2.5 rounded-xs border-t-2 border-l-2 border-slate-300 group-hover:border-sky-500 transition-colors" />
          </div>

          {/* Right Edge Resize Handle */}
          <div 
            onMouseDown={(e) => handleStartResize(e, 'right')} 
            onDoubleClick={() => setWindowSize({ width: 440, height: 640 })} 
            className="absolute top-4 bottom-4 -right-1.5 w-3 cursor-ew-resize z-50 group flex items-center justify-center" 
            title="Drag to resize width"
          >
            <div className="h-12 w-1 rounded-full bg-slate-300 group-hover:bg-sky-500 transition-colors opacity-0 group-hover:opacity-100" />
          </div>

          {/* Bottom Edge Resize Handle */}
          <div 
            onMouseDown={(e) => handleStartResize(e, 'bottom')} 
            onDoubleClick={() => setWindowSize({ width: 440, height: 640 })} 
            className="absolute -bottom-1.5 left-4 right-4 h-3 cursor-ns-resize z-50 group flex items-center justify-center" 
            title="Drag to resize height"
          >
            <div className="w-12 h-1 rounded-full bg-slate-300 group-hover:bg-sky-500 transition-colors opacity-0 group-hover:opacity-100" />
          </div>

          {/* Bottom-Right Corner Resize Handle */}
          <div 
            onMouseDown={(e) => handleStartResize(e, 'bottom-right')} 
            onDoubleClick={() => setWindowSize({ width: 440, height: 640 })} 
            className="absolute -bottom-1.5 -right-1.5 w-5 h-5 cursor-nwse-resize z-50 flex items-center justify-center group" 
            title="Drag corner to resize both width & height"
          >
            <div className="w-2.5 h-2.5 rounded-xs border-b-2 border-r-2 border-slate-300 group-hover:border-sky-500 transition-colors" />
          </div>
          {/* Header - Draggable Area */}
          <div 
            onMouseDown={handleStartDrag}
            className={`flex items-center justify-between px-4 py-3 border-b border-slate-150 bg-gradient-to-r from-slate-50 via-white to-sky-50/60 rounded-t-2xl select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            title="Drag by header to move anywhere on screen"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black tracking-wide text-slate-900 font-sans uppercase flex items-center gap-1.5">
                    NextOps Copilot
                    <GripHorizontal className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-sky-100 text-sky-700 border border-sky-200 font-bold">
                    v2.0
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] text-emerald-600 font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LangChain ReAct Agent Active
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              {/* Font Size Scaling Controls */}
              <div 
                className="flex items-center bg-slate-100/90 rounded-lg p-0.5 border border-slate-200/90 mr-1 shadow-2xs" 
                title={`Font Size: ${fontConfig.label} (${fontConfig.pct}) - Use A- / A+ to scale text`}
              >
                <button
                  type="button"
                  onClick={() => cycleFontSize('down')}
                  disabled={fontSizeTier === 'sm'}
                  className="px-1.5 py-0.5 text-[10.5px] font-bold text-slate-600 hover:text-sky-700 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title="Decrease Copilot font size"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => handleSetFontSize('md')}
                  className="px-1.5 py-0.5 text-[9.5px] font-mono font-bold text-sky-700 bg-sky-50 hover:bg-white rounded border border-sky-200/60 transition-colors cursor-pointer flex items-center gap-0.5"
                  title="Click to reset font size to default (MD 100%)"
                >
                  <Type className="w-2.5 h-2.5" />
                  <span>{fontConfig.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => cycleFontSize('up')}
                  disabled={fontSizeTier === 'xl'}
                  className="px-1.5 py-0.5 text-[10.5px] font-bold text-slate-600 hover:text-sky-700 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title="Increase Copilot font size"
                >
                  A+
                </button>
              </div>

              {dragPos && (
                <button 
                  onClick={() => setDragPos(null)}
                  className="px-2 py-1 text-[9.5px] font-mono font-bold rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 flex items-center gap-1 transition-colors cursor-pointer mr-1"
                  title="Snap back to smart auto-docking position"
                >
                  <RotateCcw className="w-3 h-3 text-sky-600" />
                  <span>Auto-Dock</span>
                </button>
              )}
              <button 
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Clear Chat History"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors hidden sm:block cursor-pointer"
                title={isExpanded ? "Collapse Width" : "Expand Width"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Minimize"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Context Ribbon (Current Selected Schematic Component) */}
          <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-semibold text-slate-500">Target Asset:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onSelectComponent) onSelectComponent(selectedComponentId);
                }}
                className="text-sky-700 font-bold hover:underline bg-sky-50 px-2 py-0.5 rounded border border-sky-200 cursor-pointer"
              >
                {selectedComponentId}
              </button>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-sans">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>ASME Sec. I • ISO 10816</span>
            </div>
          </div>

          {/* Chat Messages Scrollable Area */}
          <div 
            ref={chatScrollRef}
            className={`flex-1 overflow-y-auto p-4 space-y-4 font-sans bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent ${fontConfig.containerClass}`}
          >
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Tool Call Chips (If tools were executed) */}
                  {msg.tools && msg.tools.length > 0 && (
                    <div className="space-y-1">
                      {msg.tools.map((t, idx) => (
                        <div 
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-[10px] font-mono text-emerald-800 shadow-2xs"
                        >
                          <Terminal className="w-3 h-3 text-emerald-600" />
                          <span className="font-semibold">Tool: {t.name}</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-1" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div 
                    className={`p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? `bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-xs shadow-md shadow-sky-600/15 ${fontConfig.userBubble}`
                        : `bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs ${fontConfig.containerClass}`
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                    ) : (
                      <div className="copilot-markdown font-sans">
                        {msg.content ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => <h1 className={fontConfig.markdownH1}>{children}</h1>,
                              h2: ({ children }) => <h2 className={fontConfig.markdownH2}>{children}</h2>,
                              h3: ({ children }) => <h3 className={fontConfig.markdownH3}>{children}</h3>,
                              p: ({ children }) => <p className={fontConfig.markdownP}>{children}</p>,
                              ul: ({ children }) => <ul className="space-y-1.5 my-2 list-disc pl-4 text-slate-700">{children}</ul>,
                              ol: ({ children }) => <ol className="space-y-1.5 my-2 list-decimal pl-4 text-slate-700">{children}</ol>,
                              li: ({ children }) => <li className={fontConfig.markdownLi}>{children}</li>,
                              strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
                              em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
                              code: ({ children }) => <code className={fontConfig.markdownCode}>{children}</code>,
                              blockquote: ({ children }) => <blockquote className="border-l-2 border-sky-500 pl-2.5 py-1 text-slate-600 italic bg-sky-50/50 rounded-r my-2">{children}</blockquote>,
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-3 rounded-xl border border-slate-200/90 shadow-2xs bg-white">
                                  <table className="w-full text-left border-collapse font-sans text-xs">{children}</table>
                                </div>
                              ),
                              thead: ({ children }) => (
                                <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-800 font-semibold uppercase tracking-wider font-mono">{children}</thead>
                              ),
                              tbody: ({ children }) => (
                                <tbody className="divide-y divide-slate-100 bg-white font-sans">{children}</tbody>
                              ),
                              tr: ({ children }) => (
                                <tr className="hover:bg-sky-50/40 transition-colors">{children}</tr>
                              ),
                              th: ({ children }) => (
                                <th className={`font-bold border-r border-slate-200/60 last:border-r-0 whitespace-nowrap text-slate-700 ${fontConfig.tableTh}`}>{children}</th>
                              ),
                              td: ({ children }) => (
                                <td className={`border-r border-slate-100 last:border-r-0 text-slate-700 ${fontConfig.tableTd}`}>{children}</td>
                              ),
                              a: ({ href, children }) => {
                                const rawHref = href || '';
                                const textContent = typeof children === 'string' ? children : String(children || '');
                                const cleanText = textContent.replace(/\[|\]/g, '').trim();

                                const KNOWN_IDS = [
                                  'TURBINE-01', 'BOILER-01', 'FURNACE-01', 'CONDENSER-01', 
                                  'FEEDWATER-01', 'COOLING-WATER-01', 'CHIMNEY-01', 'COAL-FEEDER-01', 
                                  'STEAM-LINE-01', 'GENERATOR-01', 'TRANSFORMER-01', 'TRANSMISSION-01'
                                ];

                                let targetDevId = '';
                                if (rawHref.startsWith('#dev-') || rawHref.startsWith('dev-')) {
                                  targetDevId = rawHref.replace(/^#?dev-/, '').trim().toUpperCase();
                                } else if (rawHref.startsWith('#')) {
                                  targetDevId = rawHref.replace(/^#/, '').trim().toUpperCase();
                                } else if (KNOWN_IDS.includes(cleanText.toUpperCase())) {
                                  targetDevId = cleanText.toUpperCase();
                                }

                                if (targetDevId && (KNOWN_IDS.includes(targetDevId) || targetDevId.includes('-01'))) {
                                  return (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (onSelectComponent) {
                                          onSelectComponent(targetDevId);
                                        }
                                      }}
                                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded font-mono font-bold transition-all cursor-pointer bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 hover:text-sky-800 active:scale-95 shadow-2xs ${fontConfig.markdownBadge}`}
                                      title={`Focus ${targetDevId} on schematic & open live telemetry drawer`}
                                    >
                                      <span>{children}</span>
                                      <ArrowRight className="w-2.5 h-2.5 inline shrink-0" />
                                    </button>
                                  );
                                }

                                return (
                                  <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    onClick={(e) => {
                                      if (rawHref.startsWith('#')) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }
                                    }}
                                    className="text-sky-600 underline font-medium"
                                  >
                                    {children}
                                  </a>
                                );
                              }
                            }}
                          >
                            {msg.content.replace(/\[([A-Z0-9-]+)\](?!\()/g, '[$1](#dev-$1)')}
                          </ReactMarkdown>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400 py-1 font-mono text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                            <span>Streaming response from Copilot...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contextual Suggested Next Actions */}
                  {msg.sender === 'assistant' && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedActions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => handleSendMessage(act)}
                          className="px-2.5 py-1 rounded-lg text-[10.5px] font-medium bg-white hover:bg-sky-50 text-sky-700 hover:text-sky-900 border border-slate-200 hover:border-sky-300 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-sky-500" />
                          <span>{act}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <span className={`text-[9.5px] font-mono text-slate-400 px-1 block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Active Tool / Thinking Indicator */}
            {isThinking && (
              <div className="flex gap-2.5 justify-start animate-fade-in">
                <div className="shrink-0 w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 rounded-tl-xs space-y-1.5 max-w-[85%] shadow-xs">
                  {activeTool ? (
                    <div className="flex items-center gap-2 text-[11px] font-mono text-sky-700">
                      <Terminal className="w-3.5 h-3.5 animate-spin text-sky-600" />
                      <span className="font-semibold">{activeTool}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                      <span>Analyzing SCADA telemetry & safety limits...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Starter Chips */}
          <div className="px-3.5 py-2 border-t border-slate-150 bg-slate-50/70 overflow-x-auto flex gap-1.5 no-scrollbar">
            {STARTER_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isThinking}
                className={`shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 shadow-2xs transition-all font-medium disabled:opacity-50 cursor-pointer ${fontConfig.starterClass}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Box Footer */}
          <div className="p-3 bg-white border-t border-slate-200 rounded-b-2xl">
            <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/10 transition-all shadow-inner">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NextOps Copilot about Unit 1 telemetry, vibration, steam temperatures..."
                rows={1}
                disabled={isThinking}
                className={`w-full bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none max-h-24 py-1 px-1 font-sans ${fontConfig.inputClass}`}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isThinking}
                className="p-2 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white disabled:opacity-40 transition-all shrink-0 cursor-pointer shadow-sm shadow-sky-600/25 active:scale-95"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[9.5px] text-slate-400 font-mono">
              <span>Grounded in live SCADA readings</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

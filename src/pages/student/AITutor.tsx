/* ============================================
   VIDYA AI — AI Tutor Doubt & Chat Persistence
   ============================================ */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, RotateCcw, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { streamAIResponse } from '../../lib/ai-engine';
import { generateId } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { db } from '../../lib/db';
import { speakText, getSpeechRecognizer } from '../../lib/voice';
import { MarkdownRenderer } from '../../components/chat/MarkdownRenderer';
import { GyaniMascot } from '../../components/mascot/GyaniMascot';
import './AITutor.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

const SUGGESTIONS = [
  { text: 'Explain quadratic equations in simple words' },
  { text: 'What is Newton\'s Second Law?' },
  { text: 'Explain the 12 tenses in English grammar' },
  { text: 'Solve the equation: 2x + 5 = 15' },
];

export const AITutorPage: React.FC = () => {
  const { user, studentProfile } = useAuthStore();
  const { language } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  
  // Voice Synthesis State
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const playbackControlsRef = useRef<any>(null);

  // Speech Recognition (STT) State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Initialize or fetch persistent session
  useEffect(() => {
    const initChat = async () => {
      if (!user) return;

      // Check if a session already exists for this user
      let session = await db.chatSessions
        .where('userId')
        .equals(user.id)
        .first();

      let sessionId = '';
      if (!session) {
        // Create new session
        sessionId = generateId();
        await db.chatSessions.add({
          id: sessionId,
          userId: user.id,
          title: 'General Tutor Conversation',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messageCount: 0,
        });

        // Add welcome message to Dexie
        const welcomeId = generateId();
        await db.chatMessages.add({
          id: welcomeId,
          sessionId: sessionId,
          role: 'assistant',
          content: `Hello ${user.name}! I am Gyani, your AI doubt companion. I can solve linear equations step-by-step, explain Newton's physical laws, list English grammar rules, or review any syllabus concept. What would you like to study?`,
          contentType: 'text',
          createdAt: Date.now(),
          synced: true,
        });
      } else {
        sessionId = session.id;
      }

      setActiveSessionId(sessionId);

      // Load session messages
      const dbMsgs = await db.chatMessages
        .where('sessionId')
        .equals(sessionId)
        .sortBy('createdAt');

      setMessages(
        dbMsgs.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.createdAt,
        }))
      );
    };

    initChat();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Clean up speaking and recognition on unmount
  useEffect(() => {
    return () => {
      if (playbackControlsRef.current) {
        playbackControlsRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isGenerating || !activeSessionId) return;

    // Stop speaking if playing
    if (playbackControlsRef.current) {
      playbackControlsRef.current.stop();
      setSpeakingMsgId(null);
    }

    const userMsgId = generateId();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    // 1. Add user message locally and to Dexie
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    await db.chatMessages.add({
      id: userMsgId,
      sessionId: activeSessionId,
      role: 'user',
      content: messageText,
      contentType: 'text',
      createdAt: Date.now(),
      synced: false,
    });

    // 2. Create placeholder assistant message
    const assistantMsgId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      },
    ]);

    // Gather student context parameters
    const studentContext = {
      grade: studentProfile?.grade ?? 10,
      board: studentProfile?.board ?? 'CBSE',
      subject: 'general',
    };

    // 3. Stream AI response tokens
    let fullContent = '';
    const stream = streamAIResponse(messageText, studentContext, language);

    for await (const token of stream) {
      fullContent += token;
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, content: fullContent } : m))
      );
    }

    // 4. Save assistant response to Dexie
    await db.chatMessages.add({
      id: assistantMsgId,
      sessionId: activeSessionId,
      role: 'assistant',
      content: fullContent,
      contentType: 'text',
      createdAt: Date.now(),
      synced: false,
    });

    // Update session timestamp
    await db.chatSessions.update(activeSessionId, {
      updatedAt: Date.now(),
    });

    // Mark streaming complete
    setMessages((prev) =>
      prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
    );
    setIsGenerating(false);
  };

  const handleClearHistory = async () => {
    if (!activeSessionId) return;

    // Stop speech playback
    if (playbackControlsRef.current) {
      playbackControlsRef.current.stop();
      setSpeakingMsgId(null);
    }

    // Delete messages in Dexie for this session
    await db.chatMessages.where('sessionId').equals(activeSessionId).delete();

    // Add new welcome message
    const welcomeId = generateId();
    const welcomeContent = 'History refreshed. Ask me any doubt about Mathematics, Science, or English!';
    await db.chatMessages.add({
      id: welcomeId,
      sessionId: activeSessionId,
      role: 'assistant',
      content: welcomeContent,
      contentType: 'text',
      createdAt: Date.now(),
      synced: true,
    });

    setMessages([
      {
        id: welcomeId,
        role: 'assistant',
        content: welcomeContent,
        timestamp: Date.now(),
      },
    ]);
  };

  // TTS Read Aloud Trigger
  const handleToggleSpeak = async (msgId: string, content: string) => {
    if (speakingMsgId === msgId) {
      // Toggle off
      if (playbackControlsRef.current) {
        playbackControlsRef.current.stop();
      }
      setSpeakingMsgId(null);
      return;
    }

    // Stop current speech if any
    if (playbackControlsRef.current) {
      playbackControlsRef.current.stop();
    }

    setSpeakingMsgId(msgId);
    
    // Clean markdown structure before sending to TTS
    const speechContent = content.replace(/[\*\$\#\-\[\]\(\)\<\>\/]/g, ' ');

    const controls = await speakText(
      speechContent,
      () => {}, // onStart
      () => setSpeakingMsgId(null), // onEnd
      () => setSpeakingMsgId(null) // onError
    );

    playbackControlsRef.current = controls;
  };

  // STT Dictation Trigger
  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognizer = getSpeechRecognizer(
      language,
      (text) => {
        setInput((p) => p + ' ' + text);
        setIsListening(false);
      },
      () => setIsListening(false),
      (err) => {
        console.error('[STT] Speech capture error:', err);
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      setIsListening(true);
      recognizer.start();
    } else {
      alert('Speech Recognition is not supported or permission denied in this browser.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header__info">
          <div className="chat-header__avatar">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="chat-header__name">Ask Gyani</h2>
            <span className="chat-header__status">● Persistent AI Solver</span>
          </div>
        </div>
        <div className="chat-header__actions">
          <button className="chat-header__btn" title="Refresh doubt thread" onClick={handleClearHistory}>
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="chat-msg__mascot">
                <GyaniMascot state={isGenerating ? 'thinking' : 'explaining'} size="sm" />
              </div>
            )}
            <div className={`chat-msg__bubble chat-msg__bubble--${msg.role}`}>
              <div className="chat-msg__content">
                <MarkdownRenderer content={msg.content} />
                {msg.isStreaming && <span className="chat-cursor">▊</span>}
              </div>
              <div className="chat-msg__footer">
                <span className="chat-msg__time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === 'assistant' && !msg.isStreaming && (
                  <button
                    className={`chat-msg__audio-btn ${speakingMsgId === msg.id ? 'active' : ''}`}
                    title="Speak notes aloud"
                    onClick={() => handleToggleSpeak(msg.id, msg.content)}
                  >
                    {speakingMsgId === msg.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (show when few messages) */}
      {messages.length <= 1 && !isGenerating && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="chat-suggestion" onClick={() => handleSend(s.text)}>
              <span>{s.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Section */}
      <div className="chat-input-area">
        <div className="chat-input-wrap">
          <button
            className={`chat-mic-btn ${isListening ? 'listening' : ''}`}
            title="Dictate message (STT)"
            onClick={handleToggleListening}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask a question or solve: 2x + 5 = 15..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isGenerating}
          />
          <button
            className={`chat-send ${input.trim() ? 'chat-send--active' : ''}`}
            onClick={() => handleSend()}
            disabled={!input.trim() || isGenerating}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="chat-disclaimer">
          AI doubts are resolved in real-time. Audio output requires connection or local cache.
        </p>
      </div>
    </div>
  );
};

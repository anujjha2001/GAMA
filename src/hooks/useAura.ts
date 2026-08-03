import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: any[];
  attachments?: any[]; // PDF/CSV/Video attachments
  isSearchingImages?: boolean;
  thinkingState?: string; // Shows active state, like "Analyzing Report..."
}

export function useAura() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi, I am AURA. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Attachments State
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, { stage: string; progress: number }>>({});

  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Restore Conversation History & Typing Draft on Mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedDraft = localStorage.getItem('gama_aura_typing_state');
    if (savedDraft) {
      setInput(savedDraft);
    }

    const savedConvId = localStorage.getItem('gama_active_conv_id');
    if (savedConvId) {
      loadConversation(savedConvId);
    }
  }, []);

  // Save typing draft
  const handleInputChange = useCallback((val: string) => {
    setInput(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gama_aura_typing_state', val);
    }
  }, []);

  // Save conversationId
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (conversationId) {
      localStorage.setItem('gama_active_conv_id', conversationId);
    } else {
      localStorage.removeItem('gama_active_conv_id');
    }
  }, [conversationId]);

  // Clean up typing draft on successful send
  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gama_aura_typing_state');
    }
  };

  // 2. Upload file pipeline with progress, virus scanning, validation
  const uploadFile = useCallback(async (file: File) => {
    const fileName = file.name;
    try {
      // Step A: Virus check simulation
      setUploadingFiles(prev => ({
        ...prev,
        [fileName]: { stage: 'Virus scanning...', progress: 10 }
      }));
      await new Promise(r => setTimeout(r, 200));

      // Step B: File validation
      setUploadingFiles(prev => ({
        ...prev,
        [fileName]: { stage: 'Validating format...', progress: 30 }
      }));
      await new Promise(r => setTimeout(r, 200));

      // Step C: Uploading percentage
      setUploadingFiles(prev => ({
        ...prev,
        [fileName]: { stage: 'Uploading...', progress: 50 }
      }));

      // Set up upload request
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress counter
      const interval = setInterval(() => {
        setUploadingFiles(prev => {
          if (!prev[fileName] || prev[fileName].progress >= 90) {
            clearInterval(interval);
            return prev;
          }
          return {
            ...prev,
            [fileName]: { ...prev[fileName], progress: prev[fileName].progress + 10 }
          };
        });
      }, 100);

      const res = await fetch('/api/aura/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Complete progress
      setUploadingFiles(prev => ({
        ...prev,
        [fileName]: { stage: 'Completed', progress: 100 }
      }));
      
      // Add to attachments
      setAttachments(prev => [...prev, {
        url: data.url,
        name: data.name,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        classification: data.classification,
        extractedText: data.extractedText
      }]);

      toast.success(`${file.name} uploaded and scanned successfully!`);
      
      // Delay clear of progress indicator
      setTimeout(() => {
        setUploadingFiles(prev => {
          const next = { ...prev };
          delete next[fileName];
          return next;
        });
      }, 800);

    } catch (err: any) {
      console.error('[Upload Hook Error]:', err);
      setUploadingFiles(prev => ({
        ...prev,
        [fileName]: { stage: `Error: ${err.message || 'Upload failed'}`, progress: 0 }
      }));
      toast.error(`Failed to upload ${file.name}: ${err.message || 'Check file size & type.'}`);
    }
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== index));
  }, []);

  // 3. Form Submit lifecycle with multi-modal attachment insertion
  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement> | string) => {
    if (e && typeof e !== 'string') e.preventDefault();
    const queryText = typeof e === 'string' ? e.trim() : input.trim();
    if (!queryText || isLoading) return;

    clearDraft();
    setInput('');
    setIsLoading(true);

    const userMessageId = Date.now().toString();
    const currentAttachments = [...attachments];
    setAttachments([]); // Clear picker

    // Construct local user message containing attachment visual list
    const userMessage: Message = { 
      id: userMessageId, 
      role: 'user', 
      content: queryText,
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // 4. Integrated Image Generation Flow
    const promptLower = queryText.toLowerCase();
    const isImageGen = promptLower.startsWith('/image') || 
                      promptLower.includes('generate a meal') || 
                      promptLower.includes('generate my healthy meal') || 
                      promptLower.includes('generate my body') || 
                      promptLower.includes('generate gym poster') || 
                      promptLower.includes('generate dashboard wallpaper') || 
                      promptLower.includes('generate anatomy diagram') || 
                      promptLower.includes('generate exercise steps') || 
                      promptLower.includes('generate healthy recipe') || 
                      promptLower.includes('generate a recipe') || 
                      promptLower.includes('generate my future body');

    if (isImageGen) {
      const assistantMsgId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '', thinkingState: 'Generating Image...' }
      ]);

      try {
        const genRes = await fetch('/api/aura/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: queryText }),
        });

        if (!genRes.ok) {
          throw new Error('Image generation service temporary issue.');
        }

        const data = await genRes.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to generate image');
        }

        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          lastMsg.thinkingState = undefined;
          lastMsg.content = `Here is the visualization for: **"${queryText}"**`;
          lastMsg.images = [{
            title: data.title,
            imageUrl: data.imageUrl,
            thumbnailUrl: data.imageUrl,
            sourceUrl: data.imageUrl,
            sourceName: data.sourceName,
            license: data.license,
            altText: data.altText
          }];
          return updated;
        });

      } catch (err: any) {
        console.error('[Image Gen Hook Error]:', err);
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          lastMsg.thinkingState = undefined;
          lastMsg.content = "⚠️ I'm having trouble reaching the image generation service right now. Please try again in a moment.";
          return updated;
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 5. Normal Multimodal AI Chat / Streaming
    abortControllerRef.current = new AbortController();

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      { id: assistantMsgId, role: 'assistant', content: '', thinkingState: 'Thinking...' }
    ]);

    // Parse image attachments into standard Vision data structure if present
    const imageAttachment = currentAttachments.find(a => a.mimeType.startsWith('image/'));
    const docAttachmentsText = currentAttachments
      .filter(a => a.extractedText)
      .map(a => `[Attached Document: ${a.name} (Type: ${a.classification})]\n--- Extracted Content ---\n${a.extractedText}\n------------------------`)
      .join('\n\n');

    let finalPrompt = queryText;
    if (docAttachmentsText) {
      finalPrompt = `${finalPrompt}\n\n${docAttachmentsText}`;
    }

    // Standard Message payload clean-up
    const apiMessages = newMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Update last message content if finalPrompt expanded
    if (apiMessages.length > 0) {
      apiMessages[apiMessages.length - 1].content = finalPrompt;
    }

    try {
      // Simulate state progression logs
      const stateInterval = setInterval(() => {
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (!lastMsg || !lastMsg.thinkingState) {
            clearInterval(stateInterval);
            return prev;
          }
          if (lastMsg.thinkingState === 'Thinking...') {
            lastMsg.thinkingState = imageAttachment ? 'Analyzing Image...' : 'Searching Medical Memory...';
          } else if (lastMsg.thinkingState === 'Analyzing Image...') {
            lastMsg.thinkingState = 'Comparing Nutrition Database...';
          } else if (lastMsg.thinkingState === 'Searching Medical Memory...') {
            lastMsg.thinkingState = 'Checking Health History...';
          } else if (lastMsg.thinkingState === 'Checking Health History...') {
            lastMsg.thinkingState = 'Reasoning...';
          }
          return updated;
        });
      }, 700);

      const response = await fetch('/api/v1/aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: apiMessages,
          conversationId,
          image: imageAttachment ? imageAttachment.url : undefined
        }),
        signal: abortControllerRef.current.signal,
        credentials: 'include',
      });

      clearInterval(stateInterval);

      if (!response.ok) {
        if (response.status === 429) {
          try {
            const data = await response.json();
            if (data.fallbackMessage) {
              setMessages(prev => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                lastMsg.thinkingState = undefined;
                lastMsg.content = data.fallbackMessage;
                return updated;
              });
              setIsLoading(false);
              return;
            }
          } catch (e) { }
        }
        throw new Error(`Server error ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        
        if (data.success === false && data.fallbackMessage) {
          setMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            lastMsg.thinkingState = undefined;
            lastMsg.content = data.fallbackMessage;
            return updated;
          });
          setIsLoading(false);
          return;
        }

        if (data.conversationId) {
          setConversationId(data.conversationId);
        }

        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          lastMsg.thinkingState = undefined;
          lastMsg.content = data.message || '';
          if (data.visual?.enabled && data.visual.url) {
            lastMsg.images = [{
              title: data.visual.title || `Visualizing: ${data.visual.query}`,
              imageUrl: data.visual.url,
              thumbnailUrl: data.visual.url,
              sourceUrl: data.visual.url,
              sourceName: data.visual.source || 'Image Source',
              license: data.visual.license || 'Free license',
              altText: data.visual.altText || `Visual representation`
            }];
          }
          return updated;
        });
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream available.');

      const decoder = new TextDecoder();
      let assistantMessage = '';

      // Clear the thinking state and begin streaming
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        lastMsg.thinkingState = undefined;
        return updated;
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = assistantMessage;
          return updated;
        });
      }

      // Check if image search was requested from intermediate thoughts
      const match = assistantMessage.match(/\[tool:image_search query="([^"]+)"\]/);
      if (match) {
        const query = match[1];
        const cleanContent = assistantMessage.replace(/\[tool:image_search query="[^"]+"\]/g, '').trim();

        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          lastMsg.content = cleanContent;
          lastMsg.isSearchingImages = true;
          return updated;
        });

        try {
          const imgRes = await fetch(`/api/aura/images?query=${encodeURIComponent(query)}`, {
            credentials: 'include'
          });
          if (imgRes.ok) {
            const data = await imgRes.json();
            setMessages(prev => {
              const updated = [...prev];
              const lastMsg = updated[updated.length - 1];
              lastMsg.isSearchingImages = false;
              if (data.results && data.results.length > 0) {
                lastMsg.images = data.results;
              }
              return updated;
            });
          }
        } catch (imgErr) {
          console.error('[useAura] Image search failed:', imgErr);
          setMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            lastMsg.isSearchingImages = false;
            return updated;
          });
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Aura Chat Error:', error);
        
        // Friendly failover error response. Never show stack trace or HTTP status error codes directly to user.
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg) {
            lastMsg.thinkingState = undefined;
            lastMsg.content = "⚠️ I'm having trouble reaching the AI service right now. Please try again in a moment.";
          } else {
            updated.push({
              id: Date.now().toString() + 'err',
              role: 'assistant',
              content: "⚠️ I'm having trouble reaching the AI service right now. Please try again in a moment."
            });
          }
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, messages, isLoading, conversationId, attachments]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const startNewChat = useCallback(() => {
    setMessages([
      { id: '1', role: 'assistant', content: 'Hi, I am AURA. How can I help you today?' }
    ]);
    setConversationId(null);
    setAttachments([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gama_active_conv_id');
      localStorage.removeItem('gama_aura_typing_state');
    }
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/aura/history?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.conversation) {
          const loadedMessages = data.conversation.messages.map((m: any) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content
          }));
          setMessages(loadedMessages.length > 0 ? loadedMessages : [
            { id: '1', role: 'assistant', content: 'Hi, I am AURA. How can I help you today?' }
          ]);
          setConversationId(id);
        }
      }
    } catch (err) {
      console.error('[useAura] Failed to load conversation:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    messages, 
    setMessages, 
    input, 
    setInput: handleInputChange, 
    handleSubmit, 
    isLoading, 
    stop, 
    conversationId, 
    loadConversation, 
    startNewChat,
    attachments,
    setAttachments,
    uploadFile,
    removeAttachment,
    uploadingFiles
  };
}

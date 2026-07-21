import { useState, useCallback, useRef } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: any[];
  isSearchingImages?: boolean;
}

export function useAura() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi, How can I help you buddy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement> | string) => {
    if (e && typeof e !== 'string') e.preventDefault();
    const queryText = typeof e === 'string' ? e.trim() : input.trim();
    if (!queryText || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: queryText };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    // Filter out empty-content messages (streaming placeholders) before sending to API
    const apiMessages = newMessages.filter(m => m.content.trim().length > 0);

    try {
      const response = await fetch('/api/aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortControllerRef.current.signal,
        credentials: 'include',
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Server error ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + 'a',
            role: 'assistant',
            content: data.message || '',
            images: data.visual?.enabled && data.visual.url ? [{
              title: data.visual.title || `Visualizing: ${data.visual.query}`,
              imageUrl: data.visual.url,
              thumbnailUrl: data.visual.url,
              sourceUrl: data.visual.url,
              sourceName: data.visual.source || 'Image Source',
              license: data.visual.license || 'Free license',
              altText: data.visual.altText || `Visual representation of ${data.visual.query}`
            }] : undefined
          }
        ]);
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream available.');

      const decoder = new TextDecoder();
      let assistantMessage = '';

      // Add a temporary empty assistant message to stream into
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + 'a', role: 'assistant', content: '' }
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = assistantMessage;
          return updated;
        });
      }

      // Check if image search was requested
      const match = assistantMessage.match(/\[tool:image_search query="([^"]+)"\]/);
      if (match) {
        const query = match[1];
        const cleanContent = assistantMessage.replace(/\[tool:image_search query="[^"]+"\]/g, '').trim();

        // Immediately update with cleaned text and start loading state
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          lastMsg.content = cleanContent;
          lastMsg.isSearchingImages = true;
          return updated;
        });

        // Run query asynchronously
        try {
          const imgRes = await fetch(`/api/aura/images?query=${encodeURIComponent(query)}`, {
            credentials: 'include'
          });
          if (imgRes.ok) {
            const data = await imgRes.json();
            setMessages((prev) => {
              const updated = [...prev];
              const lastMsg = updated[updated.length - 1];
              lastMsg.isSearchingImages = false;
              if (data.results && data.results.length > 0) {
                lastMsg.images = data.results;
              }
              return updated;
            });
          } else {
            throw new Error('Image API error');
          }
        } catch (imgErr) {
          console.error('[useAura] Image search failed:', imgErr);
          setMessages((prev) => {
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
        // Show error in chat so user sees it
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + 'err',
            role: 'assistant',
            content: `⚠️ **AURA encountered an issue:** ${error.message}\n\nPlease try again.`
          }
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, messages, isLoading]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return { messages, setMessages, input, setInput, handleSubmit, isLoading, stop };
}

import { defineStore } from 'pinia';

type Listener = (data: any) => void;

class SseClient {
  private eventSource: EventSource | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private url: string;
  private reconnectDelay = 2000;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.eventSource) return;

    this.eventSource = new EventSource(this.url);

    this.eventSource.onmessage = (event: MessageEvent) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.error('[sse] Impossible de parser le message', event.data, err);
        return;
      }
      // toutes les données de l'endpoint /events sont considérées comme des "log"
      this.emit('log', data);
    };

    this.eventSource.onerror = (err) => {
      console.error('[sse] Erreur de connexion, tentative de reconnexion...', err);
      // EventSource se reconnecte automatiquement nativement,
      // mais on peut forcer un cycle propre si l'état est fermé
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.eventSource = null;
        setTimeout(() => this.connect(), this.reconnectDelay);
      }
    };

    this.eventSource.onopen = () => {
      console.log('[sse] Connecté à', this.url);
    };
  }

  on(event: string, cb: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);
  }

  off(event: string, cb: Listener) {
    this.listeners.get(event)?.delete(cb);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  close() {
    this.eventSource?.close();
    this.eventSource = null;
    this.listeners.clear();
  }
}

export const useSocketStore = defineStore('socket', () => {
  const socket = new SseClient(`${import.meta.env.VITE_ENRICHER_WEBSOCKET_URL}/events`);
  socket.connect();

  return { socket };
});
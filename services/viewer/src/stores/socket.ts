import { defineStore } from 'pinia';
import { io } from 'socket.io-client';

export const useSocketStore = defineStore('socket', () => {

  const websocketUrl = import.meta.env.VITE_ENRICHER_WEBSOCKET_URL;
  const socket = io(websocketUrl);

  return { socket }
});

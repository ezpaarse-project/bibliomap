import { defineStore } from 'pinia';
import { Socket } from 'socket.io-client';

export const useSocketStore = defineStore('socket', () => {
  const socket = ref<Socket | null>(null);

  function setSocket (socketInstance: Socket) {
    socket.value = socketInstance;
  }

  function getSocket () {
    return socket.value;
  }

  return {
    socket,
    setSocket,
    getSocket,
  };
});

import { defineStore } from 'pinia'
import { Socket } from 'socket.io-client'

export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null as Socket | null,
  }),
  actions: {
    setSocket (socketInstance: Socket) {
      this.socket = socketInstance
    },
    getSocket () {
      return this.socket;
    },
  },
})

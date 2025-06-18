import useMitt from '@/composables/useMitt';
import { useTimerStore } from './timer.ts';
import { useIndexedDBStore } from './indexed-db';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';

export const useBubblesStore = defineStore('bubbles', () => {
  const emitter = useMitt();
  const { timer } = storeToRefs(useTimerStore());

  async function sendBubbles () {
    const db = await useIndexedDBStore().getDB();
    const tx = db.transaction('events', 'readonly');
    const store = tx.objectStore('events');
    const index = store.index('by_date');

    const request = index.getAll(timer.value);

    request.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor && cursor.length) {
        cursor.forEach(bubble => {
          emitter.emit('EC', bubble.log);
        });
      }
    }

  }

  emitter.on('play', sendBubbles);

  watch(timer, () => {
    if (usePlayStateStore().state !== PlayState.PLAYING) return;
    sendBubbles();
  });
});

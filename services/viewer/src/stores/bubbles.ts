import useMitt from '@/composables/useMitt';
import { useTimerStore } from './timer.ts';
import { useIndexedDBStore } from './indexed-db';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
import { type EC } from './ec-count.ts';

export const useBubblesStore = defineStore('bubbles', () => {
  const emitter = useMitt();
  const { timer } = storeToRefs(useTimerStore());

  async function sendBubbles () {
    const db = await useIndexedDBStore().getDB();
    if (!db || usePlayStateStore().state !== PlayState.PLAYING && usePlayStateStore().state !== PlayState.PAUSED) return;
    const tx = db.transaction('events', 'readonly');
    const store = tx.objectStore('events');
    const index = store.index('by_date');

    const request = index.getAll(timer.value);

    request.onsuccess = (event: Event) => {
      const target = event.target as IDBRequest<EC[]>;
      if (!target) return;
      const result = target.result;
      if (!result) return;
      const cursor = result;
      if (usePlayStateStore().state !== PlayState.PLAYING && usePlayStateStore().state !== PlayState.PAUSED) return;
      if (cursor && cursor.length) {
        cursor.forEach((bubble: EC) => {
          emitter.emit('EC', bubble.log);
        });
      }
    }
  }

  emitter.on('play', sendBubbles);

  watch(timer, () => {
    if (usePlayStateStore().state !== PlayState.PLAYING && usePlayStateStore().state !== PlayState.PAUSED ) return;
    sendBubbles();
  });
});

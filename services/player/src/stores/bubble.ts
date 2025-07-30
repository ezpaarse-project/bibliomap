import useMitt from '@/composables/useMitt';
import { useTimerStore } from './timer.ts';
import { useIndexedDBStore } from './indexed-db.ts';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
import { type EC } from './ec-count.ts';

export const useBubbleStore = defineStore('bubble', () => {
  const emitter = useMitt();
  const { timer } = storeToRefs(useTimerStore());
  const { state } = storeToRefs(usePlayStateStore());
  const { db } = storeToRefs(useIndexedDBStore());

  function sendBubbles () {
    console.log('HERE')
    if (!db.value || state.value !== PlayState.PLAYING && state.value !== PlayState.PAUSED) return;
    const tx = db.value.transaction('events', 'readonly');
    const store = tx.objectStore('events');
    const index = store.index('by_date');

    console.log(timer.value)
    const request = index.getAll(timer.value);

    request.onsuccess = (event: Event) => {
      const target = event.target as IDBRequest<EC[]>;
      if (!target) return;
      const result = target.result;
      if (!result) return;
      const cursor = result;
      console.log('CURSOR', cursor)
      if (cursor && cursor.length) {
        console.log('THERE')
        cursor.forEach((bubble: EC) => {
          emitter.emit('EC', bubble.log);
        });
      }
    }
  }

  watch(timer, () => {
    if (state.value === PlayState.PLAYING || state.value === PlayState.PAUSED) {
      sendBubbles();
    }
  });
});

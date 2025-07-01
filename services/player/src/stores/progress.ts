export const useProgressStore = defineStore('progress', () => {
  const progress = ref(100);
  const message = ref('')
  const active = ref(false)

  return { progress, message, active };
});

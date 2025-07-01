export const useLargeFileStore = defineStore('large-file', () => {
  const active = ref(false);
  const permission = ref(false);
  const largeFiles = ref<File[]>([]);

  return { active, permission, largeFiles }
})

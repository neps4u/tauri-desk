<script lang="ts">
  import { Toaster } from 'svelte-sonner';
  import { settings } from '../../settings/settings.svelte';

  let {
    position = 'bottom-right'
  }: {
    position?:
      'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  } = $props();

  const theme = $derived(settings.resolvedMode);
</script>

<Toaster {position} {theme} richColors closeButton />

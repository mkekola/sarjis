import { onMounted, ref } from 'vue';

interface IosNavigator extends Navigator {
  /** iOS-only, and the only reliable way to tell an installed web app there. */
  standalone?: boolean;
}

export function useStandalone() {
  const isStandalone = ref(true); // assume installed until proven otherwise, so the guide never flashes
  const isIos = ref(false);

  onMounted(() => {
    const nav = navigator as IosNavigator;
    isStandalone.value =
      window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
    isIos.value = /iphone|ipad|ipod/i.test(nav.userAgent);
  });

  return { isStandalone, isIos };
}

import { reactive } from 'vue'

export const shared = reactive({
  track: null,
  current_panel: 'channels',
  panel_badge: {},
  volume: 1,
  muted: false,
});

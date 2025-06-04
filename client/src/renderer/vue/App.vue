<script>
  import Player from './Player.vue'

  import Channels from './Channels.vue'
  import Library from './Library.vue'

  export default {
    components: {
      Player,
      Channels, Library,
    },
    data() {
      return {
        current_panel: 'channels',
        client_state: {
          channel: null,
        },
      };
    },
    methods: {
      select_panel(panel) {
        this.current_panel = panel;
      },
    },
    mounted() {
      const app_el = document.getElementById('app');
      app_el.style.height = `${window.innerHeight}px`;
      window.addEventListener('resize', e => {
        app_el.style.height = `${window.innerHeight}px`;
      });
      rs.on_state_update((e, state) => {
        this.client_state = state;
      });
    },
  }
</script>
<template>
  <div id="header">
    <a @click="select_panel('channels')">📻</a>
    <a @click="select_panel('library')">💿</a>
  </div>
  <div id="main">
    <Channels v-if="current_panel == 'channels'"></Channels>
    <Library v-else-if="current_panel == 'library'"></Library>
  </div>
  <Player v-if="client_state.channel" :channel="client_state.channel"></Player>
</template>
<style>
  body {
    margin: 0px;
  }
  #app {
    display: flex;
    flex-direction: column;
  }
  #header {
    font-size: 32px;
    line-height: 1;
    background-color: lightgray;
    padding: 8px;
  }
  #main {
    overflow: hidden;
    overflow-y: scroll;
    flex: 1 1 auto;
  }
</style>

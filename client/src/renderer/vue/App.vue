<script>
  import Player from './Player.vue'

  import Channels from './Channels.vue'
  import Library from './Library.vue'
  import Queue from './Queue.vue'

  export default {
    components: {
      Player,
      Channels, Library, Queue,
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
    <a title="Channels" @click="select_panel('channels')" v-bind:class="current_panel == 'channels' ? 'active' : ''">📻</a>
    <a title="Library" @click="select_panel('library')" v-bind:class="current_panel == 'library' ? 'active' : ''">💿</a>
    <a title="Queue" @click="select_panel('queue')" v-bind:class="current_panel == 'queue' ? 'active' : ''">☰</a>
  </div>
  <div id="main">
    <Channels v-if="current_panel == 'channels'"></Channels>
    <Library v-else-if="current_panel == 'library'"></Library>
    <Queue v-else-if="current_panel == 'queue' && client_state.channel" :channel="client_state.channel"></Queue>
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
  }
  #header a {
    display: inline-block;
    width: 50px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    border-radius: 10px;
    background-color: white;
    margin: 8px 0px 8px 8px;
  }
  #header a:hover {
    cursor: pointer;
  }
  #header a.active {
    background-color: grey;
  }
  #main {
    overflow: hidden;
    overflow-y: scroll;
    flex: 1 1 auto;
  }
</style>

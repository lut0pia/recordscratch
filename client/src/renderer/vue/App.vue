<script>
  import HeaderButton from './HeaderButton.vue'
  import NotificationTray from './NotificationTray.vue'
  import Player from './Player.vue'

  import Channels from './Channels.vue'
  import Library from './Library.vue'
  import Queue from './Queue.vue'
  import Chat from './Chat.vue'
  import Settings from './Settings.vue'

  import { shared } from './shared.js'

  const drag_events = ['dragenter', 'dragover', 'dragleave', 'drop'];

  export default {
    components: {
      HeaderButton, NotificationTray, Player,
      Channels, Library, Queue, Chat, Settings
    },
    data() {
      return {
        state: {},
        is_mobile: window.innerWidth < 1000,
      };
    },
    computed: {
      current_panel() {
        return shared.current_panel;
      }
    },
    mounted() {
      const app_el = document.getElementById('app');
      app_el.style.height = `${window.innerHeight}px`;
      app_el.classList.toggle('mobile', this.is_mobile);
      drag_events.forEach(name => {
        document.body.addEventListener(name, e => e.preventDefault());
      });
      window.addEventListener('resize', e => {
        app_el.style.height = `${window.innerHeight}px`;
      });
      rs.on_state_update((e, state) => {
        const previous_channel = this.state.channel;
        this.state = state;
        if(previous_channel && state.channel && state.channel.name != previous_channel.name) {
            delete shared.panel_badge.chat;
        }
      });
      rs.on_notification((e, notification) => {
        if(!this.state.is_browser) {
          console.log(notification.text);
        }
      });
      rs.on_chat_message((e, msg) => {
        if(shared.current_panel != 'chat') {
          if(shared.panel_badge.chat) {
            shared.panel_badge.chat += 1;
          } else {
            shared.panel_badge.chat = 1;
          }
        }
      });
      rs.init_ui_state();
    },
    unmounted() {
      drag_events.forEach(name => {
        document.body.removeEventListener(name, e => e.preventDefault());
      });
    }
  }
</script>
<template>
  <div id="header">
    <HeaderButton name="channels" icon="📻" />
    <HeaderButton v-if="!state.is_browser" name="library" icon="💿" />
    <HeaderButton v-if="state.channel && is_mobile" name="queue" icon="☰" />
    <HeaderButton v-if="state.channel" name="chat" icon="💬" />
    <HeaderButton name="settings" icon="⚙️" />
    <span v-if="state.channel" id="channel_name">#{{state.channel.name}} (🧍{{ state.channel.user_count }})</span>
  </div>
  <div id="content" v-if="state.connected">
    <div id="main">
      <Channels v-if="current_panel == 'channels'"/>
      <Library v-else-if="current_panel == 'library'" :state=state />
      <Queue v-else-if="current_panel == 'queue'" :state="state"/>
      <Chat v-else-if="current_panel == 'chat'" :state=state />
      <Settings v-else-if="current_panel == 'settings'" :state=state />
    </div>
    <Queue v-if="!is_mobile && state.channel" :state=state />
  </div>
  <NotificationTray/>
  <Player :state=state />
</template>
<style>
  body {
    margin: 0px;
    user-select: none;
  }
  #app {
    display: flex;
    flex-direction: column;
  }
  #header {
    background-color: lightgray;
  }

  #app.mobile #channel_name {
    display: block;
    margin: 0px 8px 8px;
    font-size: 18px;
  }
  #app:not(.mobile) #channel_name {
    float: right;
    line-height: 40px;
    font-size: 32px;
    margin: 8px 0px;
    width: 30%;
    min-width: 400px;
    max-width: 512px;
  }
  #content {
    display: flex;
    overflow: hidden;
    flex-direction: row;
    height: 100%;
  }
  #main {
    overflow: hidden;
    overflow-y: scroll;
    flex: 1 1 auto;
    padding: 10px;
  }
</style>

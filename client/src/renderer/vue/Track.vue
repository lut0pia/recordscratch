<script>
  import { toRaw } from 'vue';
  export default {
    props: ['state', 'track', 'post'],
    data() {
      return {
        now: 0,
      };
    },
    computed: {
      pretty_duration() {
        const seconds_total = Math.floor(this.track.duration);
        const minutes = Math.floor(seconds_total / 60);
        const seconds = seconds_total % 60;
        return `${minutes}:${seconds.toString().padStart(2,'0')}`;
      },
      can_cancel() {
        return this.post && this.post.user_id == this.state.user.id && this.post.start_time > this.now;
      },
      can_save() {
        return !this.track.file_path;
      },
    },
    methods: {
      save() {
        rs.save_track(toRaw(this.track))
      },
      preview() {
        rs.preview_track(toRaw(this.track));
      },
      queue() {
        rs.queue_post(toRaw(this.track));
      },
      cancel() {
        rs.cancel_post(toRaw(this.post));
      },
    },
    async mounted() {
      this.now = await rs.get_server_time();
      this.interval = setInterval(async () => {
        this.now = await rs.get_server_time();
      }, 1000);
    },
    unmounted() {
      clearInterval(this.interval);
    }
  }
</script>
<template>
  <div class="track">
    <div class="right">
      <div class="duration">{{ pretty_duration }}</div>
      <div class="actions">
        <span v-if="can_save" @click="save">💾</span>
        <span @click="queue">▶</span>
        <span v-if="can_cancel" @click="cancel">❌</span>
      </div>
    </div>
    <div class="left">
      <div class="title">{{ track.title }}</div>
      <div class="artist">{{ track.artist }}</div>
    </div>
   </div>
</template>
<style>
  .track {
    padding: 4px 4px;
    border-bottom: 1px solid black;
  }
  .track .right {
    float: right;
    text-align: right;
  }
  .track .artist {
    display: inline;
    color: grey;
  }
  .track .album {
    display: inline;
    color: grey;
    font-style: italic;
  }
  .track .actions span {
    cursor: pointer;
  }
</style>

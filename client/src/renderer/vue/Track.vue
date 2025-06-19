<script>
  import { toRaw } from 'vue';
  export default {
    props: ['state', 'track', 'post'],
    data() {
      return {
        now: Date.now(),
        can_save: false,
      };
    },
    computed: {
      pretty_duration() {
        const seconds_to_time = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;
        const duration = Math.floor(this.track.duration);
        const is_current_post =this.post && this.post.start_time <= this.now && (this.post.start_time+this.track.duration*1000) > this.now;
        if(is_current_post) {
          const current_time = Math.floor((this.now - this.post.start_time) / 1000);
          return `${seconds_to_time(current_time)} / ${seconds_to_time(duration)}`;
        }
        return seconds_to_time(duration);
      },
      can_cancel() {
        return this.post && this.post.user_id == this.state.user.id && this.post.start_time > this.now;
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
      this.can_save = !this.track.file_path && !await rs.is_track_on_disk(this.track.hash);
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
        <span v-if="!post" @click="queue">▶</span>
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

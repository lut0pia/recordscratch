<script>
  import { toRaw } from 'vue';
  export default {
    props: [
      'state',
    ],
    data() {
      return {
        now: 0,
        track_srcs: {},
      };
    },
    computed: {
      current_post() {
        if(this.state.channel.queue.length == 0) {
          return null;
        } else {
          return this.state.channel.queue.find(p => (p.start_time + p.track.duration * 1000) >= this.now);
        }
      },
      time_display() {
        const seconds_to_time = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;
        if(this.current_post) {
          const current_time = Math.floor((this.now - this.current_post.start_time) / 1000);
          const duration = Math.floor(this.current_post.track.duration);
          return `${seconds_to_time(current_time)} / ${seconds_to_time(duration)}`;
        }
        return '';
      },
    },
    async mounted() {
      this.now = await rs.get_server_time();
      this.interval = setInterval(async () => {
        this.now = await rs.get_server_time();

        if(this.current_post && this.current_post.track) {
          const track = this.current_post.track;
          if(!this.track_srcs[track.hash]) {
            const buffer = await rs.get_track_buffer(toRaw(track));
            if(buffer) {
              const url = await URL.createObjectURL(new Blob([buffer]));
              this.track_srcs[track.hash] = url;
            }
          }
          const audio = document.getElementById('audio');
          if(audio.src != this.track_srcs[track.hash]) {
            audio.src = this.track_srcs[track.hash]
          }
          const wanted_current_time = (this.now - this.current_post.start_time) / 1000;
          if(Math.abs(audio.currentTime - wanted_current_time) > 1) {
            audio.currentTime = wanted_current_time;
          }

          audio.play();
        } else {
          audio.pause();
        }
      }, 1000);
    },
    unmounted() {
      clearInterval(this.interval);
    }
  }
</script>
<template>
  <audio id="audio"></audio>
</template>
<style>
</style>

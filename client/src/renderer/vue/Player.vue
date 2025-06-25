<script>
  import { toRaw } from 'vue';
  import { preview } from './preview.js'
  export default {
    props: [
      'state',
    ],
    data() {
      return {
        now: 0,
        track_src_hash: null,
        track_src: '',
      };
    },
    computed: {
      current_post() {
        if(!this.state.channel || this.state.channel.queue.length == 0) {
          return null;
        } else {
          return this.state.channel.queue.find(p => (p.start_time + p.track.duration * 1000) >= this.now);
        }
      },
      current_preview() {
        return preview.track;
      }
    },
    methods: {
      exit() {
        preview.track = null;
      }
    },
    async mounted() {
      this.now = await rs.get_server_time();
      this.interval = setInterval(async () => {
        this.now = await rs.get_server_time();

        let track = null;
        if(this.current_preview) {
          track = this.current_preview;
        } else if(this.current_post && this.current_post.track) {
          track = this.current_post.track;
        }

        const audio = this.$refs.audio;
        if(track) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.artist,
            album: track.album,
          });
          if(this.track_src_hash != track.hash) {
            if(this.track_src) {
              URL.revokeObjectURL(this.track_src);
              this.track_src = '';
            }
            const buffer = await rs.get_track_buffer(toRaw(track));
            if(buffer) {
              this.track_src = await URL.createObjectURL(new Blob([buffer]));
              this.track_src_hash = track.hash;
            }
          }
          if(audio.src != this.track_src) {
            audio.src = this.track_src;
          }
          if(!this.current_preview) {
            const wanted_current_time = (this.now - this.current_post.start_time) / 1000;
            if(Math.abs(audio.currentTime - wanted_current_time) > 1) {
              audio.currentTime = wanted_current_time;
            }
          }

          audio.play();
        } else {
          navigator.mediaSession.metadata = new MediaMetadata({});
          audio.src = '';
          audio.pause();
        }
      }, 100);
    },
    unmounted() {
      clearInterval(this.interval);
    }
  }
</script>
<template>
  <div id="player" :class="{preview:current_preview}">
    <div id="preview_background" @click="exit"></div>
    <audio ref="audio" controls="true"></audio>
  </div>
</template>
<style>
  #player:not(.preview) {
    display: none;
  }
  #player:not(.preview) {
    display: none;
  }
  #player.preview audio {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  #preview_background {
    position: absolute;
    top: 0px;
    bottom: 0px;
    width: 100%;
    height: 100%;
    background-color: #000a;
  }
</style>

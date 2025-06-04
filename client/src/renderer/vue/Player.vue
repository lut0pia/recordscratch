<script>
  export default {
    props: [
      'channel',
    ],
    data() {
      return {
        now: Date.now(),
        post_id: -1,
        track_srcs: {},
      };
    },
    computed: {
      current_post() {
        if(this.channel.queue.length == 0) {
          return null;
        } else {
          return this.channel.queue.find(p => (p.start_time + p.track.duration * 1000) >= this.now);
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
      current_post_src() {
        if(this.current_post) {
          return this.track_srcs[this.current_post.track.hash] || "";
        }
        return "";
      },
    },
    mounted() {
      setInterval(async () => {
        if(this.current_post) {
          const track_hash = this.current_post.track.hash;
          if(!this.track_srcs[track_hash]) {
            const buffer = await rs.get_track_buffer(track_hash);
            //console.log(buffer);
            const url = await URL.createObjectURL(new Blob([buffer], {type: 'audio/mp3'}));
            this.track_srcs[track_hash] = url;
          }
        }
        this.now = Date.now()
      }, 1000);
    },
  }
</script>
<template>
  <div v-if="current_post != null" id="player">
    <div class="title">{{current_post.track.title}}</div>
    <div class="artist">{{current_post.track.artist}}</div>
    <div class="duration">{{time_display}}</div>
  </div>
  <audio v-bind:src="current_post_src" controls autoplay></audio>
</template>
<style>
  #player {
    flex: none;
    height: 64px;
    background-color: aliceblue;
  }
</style>

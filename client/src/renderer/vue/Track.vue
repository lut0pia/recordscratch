<script>
  import UserName from './UserName.vue';
  import { toRaw } from 'vue';
  import { shared } from './shared.js'
  export default {
    props: ['state', 'track', 'post'],
    components: {
      UserName,
    },
    data() {
      return {
        now: Date.now(),
        can_save: false,
      };
    },
    computed: {
      pretty_artist() {
        let artist = this.track.artist;
        while(artist.length > 20) {
          if(artist.includes(',')) {
            artist = artist.slice(0, artist.lastIndexOf(','));
          } else {
            break;
          }
        }

        return artist.trim();
      },
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
      can_queue() {
        return this.state && this.state.channel && !this.post;
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
        shared.track = toRaw(this.track);
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
    async updated() {
      this.can_save = !this.state.is_browser
       && !this.track.file_path
       && this.post.user_id != this.state.user.id
       && !await rs.is_track_on_disk(this.track.hash);
      if(this.$refs.user_name) {
        this.$refs.track.style.borderColor = this.$refs.user_name.user_color;
      }
    },
    unmounted() {
      clearInterval(this.interval);
    }
  }
</script>
<template>
  <div class="track" ref="track">
    <div class="right">
      <div class="duration">{{ pretty_duration }}</div>
      <div class="actions">
        <span title="Preview" @click="preview">🎧</span>
        <span v-if="can_save" title="Save" @click="save">💾</span>
        <span v-if="can_queue" title="Queue" @click="queue">▶</span>
        <span v-if="can_cancel" title="Cancel" @click="cancel">❌</span>
      </div>
    </div>
    <div class="left" :title="pretty_artist + ' - ' + track.title">
      <UserName v-if="post" ref="user_name" :users="state.users" :user_id="post.user_id" />
      <span class="artist">{{ pretty_artist }} - </span>
      <span class="title">{{ track.title }}</span>
    </div>
   </div>
</template>
<style>
  .track {
    padding-left: 4px;
    border-left: 2px solid lightgrey;
    margin: 4px 0px;
  }
  .track:hover {
    background-color: #f0f0f0;
  }
  .track .left {
    width: calc(100% - 70px);
    text-overflow: ellipsis;
    overflow: hidden;
    text-wrap: nowrap;
  }
  :not(.post) > .track .left {
    line-height: 38px;
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

<script>
  import Track from './Track.vue';

  export default {
    props: ['post'],
    components: {
      Track,
    },
    data() {
      return {
        now: 0,
      };
    },
    computed: {
      post_class() {
        if(this.post.start_time > this.now) {
          return "future"
        }
        if((this.post.start_time + this.post.track.duration * 1000) <= this.now) {
          return "past";
        }
        return "current";
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
  <div class="post" v-bind:class="post_class">
    <Track :track=post.track />
  </div>
</template>
<style>
  .post.past {
    opacity: 0.5;
  }
  .post.current {
    background-color: lightgrey;
  }
</style>

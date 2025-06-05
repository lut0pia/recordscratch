<script>
  import Track from './Track.vue';

  export default {
    props: ['post'],
    components: {
      Track,
    },
    computed: {
      active() {
        return (this.post.start_time + this.post.track.duration * 1000) >= Date.now() && this.post.start_time < Date.now();
      },
    }
  }
</script>
<template>
  <div class="post" v-bind:class="active ? 'active' : ''">
    <Track :track=post.track />
  </div>
</template>
<style>
  .post.active {
    background-color: lightgrey;
  }
</style>

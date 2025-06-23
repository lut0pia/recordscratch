<script>
  import Track from './Track.vue';

  export default {
    props: ['state', 'post', 'now'],
    components: {
      Track,
    },
    computed: {
      post_class() {
        if(this.post.start_time > this.now) {
          return "future"
        }
        if((this.post.start_time + this.post.track.duration * 1000) <= this.now - (60 * 60 * 1000)) {
          return "obsolete";
        }
        if((this.post.start_time + this.post.track.duration * 1000) <= this.now) {
          return "past";
        }
        return "current";
      },
      completeness_ratio() {
        return (this.now - this.post.start_time) / (this.post.track.duration * 1000);
      },
    },
  }
</script>
<template>
  <div class="post" :class="post_class" 
  :style="[post_class=='current' ?{background: `linear-gradient(90deg,#eee ${completeness_ratio*100}%, transparent ${completeness_ratio*100}%)`} : {}]">
    <Track :state=state :track=post.track :post=post />
  </div>
</template>
<style>
  .post.past {
    opacity: 0.5;
  }
  .post.obsolete {
    display: none;
  }
  .post.current .track {
    background-color: transparent!important;
  }
</style>

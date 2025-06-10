<script>
  import { toRaw } from 'vue';
  export default {
    props: ['track'],
    computed: {
      pretty_duration() {
        const seconds_total = Math.floor(this.track.duration);
        const minutes = Math.floor(seconds_total / 60);
        const seconds = seconds_total % 60;
        return `${minutes}:${seconds.toString().padStart(2,'0')}`;
      }
    },
    methods: {
      queue() {
        rs.queue_post(toRaw(this.track));
      },
    },
  }
</script>
<template>
  <div class="track">
    <div class="right">
      <div class="duration">{{ pretty_duration }}</div>
      <div class="actions">
        <span>⭐</span>
        <span>🎧</span>
        <span @click="queue">▶</span>
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

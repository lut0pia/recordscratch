<script>
  import QueuePost from './QueuePost.vue';

  export default {
    props: ['channel'],
    components: {
      QueuePost,
    },
  }
</script>
<template>
  <div id="queue">
    <QueuePost
      v-for="post in this.channel.queue"
      :post=post
    />
    <div v-if="this.channel.queue.length == 0">The queue is empty</div>
  </div>
</template>
<style>
  #queue {
    max-width: 512px;
    margin: auto;
    padding-top: 48px;
  }
</style>

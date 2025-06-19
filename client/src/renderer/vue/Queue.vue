<script>
  import QueuePost from './QueuePost.vue';

  export default {
    props: ['state'],
    components: {
      QueuePost,
    },
  }
</script>
<template>
  <div id="queue">
    <QueuePost
      v-for="post in this.state.channel.queue"
      :state=state :post=post
    />
    <div v-if="this.state.channel.queue.length == 0">The queue is empty, post something!</div>
  </div>
</template>
<style>
  #queue {
    width: 30%;
    min-width: 400px;
    max-width: 512px;
    margin: 0px auto;
    overflow-y: scroll;
  }
</style>

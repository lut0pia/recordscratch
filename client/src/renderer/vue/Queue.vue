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
    <div v-if="this.state.channel.queue.length == 0">The queue is empty</div>
  </div>
</template>
<style>
  #queue {
    max-width: 512px;
    margin: auto;
    padding-top: 48px;
  }
</style>

<script>
  import QueuePost from './QueuePost.vue';

  export default {
    props: ['state'],
    components: {
      QueuePost,
    },
    data() {
      return {
        now: 0,
      };
    },
    methods: {
      async drop(e) {
        const files = [...e.dataTransfer.files];
        for(let file of files) {
          if(!file.name.match(/\.(mp3|m4a|ogg|flac)$/i)) {
            continue;
          }
          const reader = new FileReader();
          reader.onload = e => {
            rs.queue_post({
              filename: file.name,
              buffer: new Uint8Array(e.target.result),
            });
          }
          reader.readAsArrayBuffer(file);
        }
      },
    },
    async mounted() {
      this.now = await rs.get_server_time();
      this.interval = setInterval(async () => {
        this.now = await rs.get_server_time();
      }, 100);
    },
    unmounted() {
      clearInterval(this.interval);
    }
  }
</script>
<template>
  <div id="queue" @drop.prevent="drop">
    <QueuePost
      v-for="post in this.state.channel.queue"
      :state=state :post=post :now=now
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
    padding: 0px 10px;
  }
</style>

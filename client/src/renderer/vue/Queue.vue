<script>
  import QueuePost from './QueuePost.vue';

  function queue_files(files) {
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
  }

  export default {
    props: ['state'],
    components: {
      QueuePost,
    },
    data() {
      return {
        now: 0,
        drag_count: 0,
      };
    },
    methods: {
      drop(e) {
        queue_files([...e.dataTransfer.files]);
        this.drag_count = 0;
      },
      dragenter(e) {
        this.drag_count += 1;
      },
      dragleave(e) {
        this.drag_count -= 1;
      },
      
      file_input_change(e) {
        queue_files([...e.target.files]);
      }
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
  <div id="queue" :class="{dragging:drag_count>0}"
    @drop.prevent="drop" @dragenter.prevent="dragenter" @dragleave.prevent="dragleave">
    <QueuePost
      v-for="post in this.state.channel.queue"
      :state=state :post=post :now=now
    />
    <span v-if="this.state.channel.queue.length == 0">😕 The queue is empty, find some music to start playing in your library, or drag/select audio files here.</span>
    <div class="drag_icon">📥</div>
    <label class="file_input" title="Select audio files to add to queue">
      <input type="file" accept="audio/*" multiple @change="file_input_change"/>
      📥
    </label>
  </div>
</template>
<style>
  #app:not(.mobile) #queue {
    width: 30%;
    min-width: 400px;
    max-width: 512px;
    margin: 0px auto;
    overflow-y: scroll;
    padding: 10px;
  }

  #queue.dragging {
    background-color: #f0f0f0;
    position: relative;
  }
  #queue.dragging .drag_icon {
    font-size: 100px;
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
    transform-origin: center;
  }
  #queue:not(.dragging) .drag_icon {
    display: none;
  }
  #queue.dragging :not(.drag_icon) {
    display: none;
  }

  .file_input {
    background-color: #f0f0f0;
    display: block;
    cursor: pointer;
    padding-bottom: 8px;
    border-left: 2px solid lightgrey;
    margin: 4px 0px;
    text-align: center;
    font-size: 30px;
    line-height: 30px;
  }
  .file_input input {
    display: none;
  }
</style>

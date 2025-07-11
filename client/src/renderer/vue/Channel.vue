<script>
  import UserName from './UserName.vue';

  export default {
    props: ['state', 'channel', 'now'],
    components: {
      UserName,
    },
    methods: {
      async join() {
        await rs.join_channel(this.channel.name);
        this.$emit('refresh');
      },
    },
    computed: {
      current_post() {
        return this.channel.queue.find(p => (p.start_time + p.track.duration * 1000) >= this.now);
      },
      queue_posts_left() {
        return this.channel.queue.filter(p => p.start_time + p.track.duration * 1000 >= this.now).length;
      },
      queue_time_left() {
        const last_post = this.channel.queue[this.channel.queue.length - 1];
        const queue_end_ms = last_post.start_time + last_post.track.duration * 1000;
        const time_left_ms = queue_end_ms - this.now;
        const seconds = Math.round(time_left_ms / 1000);
        if(seconds < 90) {
          return `${seconds} seconds`
        }
        const minutes = Math.round(seconds / 60);
        if(minutes < 90) {
          return `${minutes} minutes`
        }
        const hours = Math.round(minutes / 60);
        return `${hours} hours`;
      },
      is_current_channel() {
        return this.state.channel && this.state.channel.name == this.channel.name;
      },
    },
  }
</script>

<template>
  <div :class="{channel:true, current:is_current_channel}" @click="join">
    <span class="name">#{{ channel.name }}</span>
    🧍{{ channel.user_count }} people
    <span v-if="queue_posts_left>0">
      💿{{ queue_posts_left }} posts
      ⏳{{ queue_time_left }}
    </span>
    <br/>
    <span v-if="current_post">
      <UserName :users="state.users" :user_id="current_post.user_id" /><br/>
      <span class="artist">{{ current_post.track.artist }} - </span>
      <span class="title">{{ current_post.track.title }}</span>
    </span>
    <span v-else>No current post</span>
  </div>
</template>
<style>
  .channel {
    padding-left: 4px;
    border-left: 2px solid lightgrey;
    margin: 4px 0px;
    cursor: pointer;
    text-overflow: ellipsis;
    overflow: hidden;
    text-wrap: nowrap;
  }
  .channel:hover, .channel.current {
    background-color: #f0f0f0;
  }

  .channel .name {
    font-size: 18px;
  }

  .channel .artist {
    display: inline;
    color: grey;
  }
</style>

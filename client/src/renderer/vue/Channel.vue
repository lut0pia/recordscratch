<script>
  export default {
    props: ['channel'],
    methods: {
      async join() {
        await rs.join_channel(this.channel.name);
        this.$emit('refresh');
      },
    },
  }
</script>

<template>
  <div class="channel">
    #{{ channel.name }} (🧍{{ channel.user_count }})
    <div class="actions">
      <span @click="join">↘️</span>
    </div>
  </div>
</template>
<style>
  .channel {
    display: inline-block;
    background-color: bisque;
    height: 64px;
    width: 128px;
    margin: 4px;
  }
</style>

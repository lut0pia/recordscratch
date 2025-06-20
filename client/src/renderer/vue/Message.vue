<script>
  export default {
    props: ['state', 'message'],
    computed: {
      user_name() {
        const user = this.state.users[this.message.user_id];
        if(user && user.name) {
          return user.name;
        }
        return `Anon#${this.message.user_id}`;
      },
    },
  }
</script>

<template>
  <div class="message">
    <span class="user_name">{{ user_name }}</span>:
    {{ message.message }}
  </div>
</template>
<style>
  .message .user_name {
    font-weight: bold;
  }
</style>

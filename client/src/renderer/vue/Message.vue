<script>
  import UserName from './UserName.vue';
  export default {
    props: ['state', 'message'],
    components: {
      UserName,
    },
    mounted() {
      this.$refs.message.style.borderColor = this.$refs.user_name.user_color;
    },
  }
</script>

<template>
  <div class="message" ref="message">
    <UserName ref="user_name" :users="state.users" :user_id="message.user_id" />
    <div>{{ message.message }}</div>
  </div>
</template>
<style>
  .message {
    border-left: 2px solid lightgray;
    padding-left: 4px;
    margin: 4px 0px;
  }
  .message .user_name {
    font-weight: bold;
  }
  .message .pronouns {
    color: grey;
    font-size: 0.8em;
  }
  .message .pronouns::before {
    content: ' (';
  }
  .message .pronouns::after {
    content: ')';
  }
</style>

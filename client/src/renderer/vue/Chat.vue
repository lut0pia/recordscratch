<script>
  import HeaderTextInput from './HeaderTextInput.vue';
  import Message from './Message.vue';

  export default {
    props: ['state'],
    components: {
      HeaderTextInput,
      Message,
    },
    data() {
      return {
        message_input: '',
      };
    },
    methods: {
      async submit() {
        if(this.message_input) {
          await rs.message_channel(this.message_input);
          this.message_input = '';
        }
      },
    },
  }
</script>

<template>
  <div id="chat">
    <HeaderTextInput
      v-model="message_input"
      placeholder="Type your message"
      @submit="submit"
    />
    <div id="messages">
      <Message v-for="message in state.chat" :state=state :message=message />
      <div v-if="state.chat.length == 0">No messages yet</div>
    </div>
  </div>
</template>
<style>
  #messages {
    max-width: 512px;
    margin: auto;
  }
</style>

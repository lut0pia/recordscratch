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
        last_chat_length: 0,
      };
    },
    methods: {
      async submit() {
        if(this.message_input) {
          await rs.message_channel(this.message_input);
          this.message_input = '';
          this.scroll_down();
        }
      },
      scroll_down(instant = false) {
        const messages_el = this.$refs.messages;
        const last_el = messages_el.lastElementChild;
        if(last_el) {
          last_el.scrollIntoView({
            behavior: instant ? 'instant' : 'smooth',
          });
        }
      },
    },
    mounted() {
      this.scroll_down(true);
    },
    updated() {
      if(this.last_chat_length != this.state.chat.length) {
        const messages_el = this.$refs.messages;
        const main_el = messages_el.parentNode.parentNode;
        const last_el = messages_el.lastElementChild;
        if(main_el.scrollTop > main_el.scrollHeight - main_el.offsetHeight - last_el.offsetHeight - 5) {
          this.scroll_down();
        }
      }
      this.last_chat_length = this.state.chat.length;
    }
  }
</script>

<template>
  <div id="chat">
    <div id="messages" ref="messages">
      <Message v-for="message in state.chat" :state=state :message=message />
      <div v-if="state.chat.length == 0">No messages yet</div>
    </div>
    <HeaderTextInput
      class="bottom"
      v-model="message_input"
      placeholder="Type your message"
      @submit="submit"
    />
  </div>
</template>
<style>
  #messages {
    max-width: 512px;
    margin: auto;
  }
</style>

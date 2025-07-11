<script>
  import Channel from './Channel.vue'
  import HeaderTextInput from './HeaderTextInput.vue';

  export default {
    props: ['state'],
    components: {
      Channel,
      HeaderTextInput
    },
    data() {
      return {
        search_query: '',
        channels: [],
        now: 0,
      };
    },
    methods: {
      async refresh() {
        this.channels = await rs.get_channels();
      },
      async submit() {
        await rs.join_channel(this.search_query);
        this.search_query = '';
        await this.refresh();
      },
    },
    async mounted() {
      this.now = await rs.get_server_time();
      await this.refresh();
      let counter = 1;
      this.interval = setInterval(async () => {
        this.now = await rs.get_server_time();
        if(counter % 60 == 0) { // Refresh channel list every minute
          await this.refresh();
        }
        counter += 1;
      }, 1000);
    },
    unmounted() {
      clearInterval(this.interval);
    },
    computed: {
      filtered_channels() {
        return this.channels.filter(channel => {
          if(!this.search_query) {
            return true;
          }
          const search_words = this.search_query.toLowerCase().split(' ').filter(w => w);
          if(search_words.length == 0) {
            return true;
          }
          const channel_searchable = `${channel.name}`.toLowerCase();
          return search_words.every(w => channel_searchable.includes(w));
        }).slice(0, 128);
      },
    },
  }
</script>
<template>
  <HeaderTextInput
    v-model="search_query"
    placeholder="Search or create"
    @submit="submit"
  />
  <div id="channels">
    <Channel
      v-for="channel in filtered_channels"
      :state=state
      :channel=channel
      :now=now
      @refresh="refresh"
    />
    <div v-if="channels.length == 0">There are no channels</div>
    <div v-else-if="filtered_channels.length == 0">No channels match the words "{{ search_query }}", press enter to create one</div>
  </div>
</template>
<style>
  #channels {
    max-width: 512px;
    margin: auto;
  }
</style>

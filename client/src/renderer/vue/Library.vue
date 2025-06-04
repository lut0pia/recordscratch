<script>
  import HeaderTextInput from './HeaderTextInput.vue';
  import Track from './Track.vue'

  export default {
    components: {
      Track,
      HeaderTextInput
  },
    data() {
      return {
        search_query: '',
        tracks: [],
      };
    },
    async mounted() {
      this.tracks = await rs.get_tracks();
    },
    computed: {
      filtered_tracks() {
        return this.tracks.filter(track => {
          if(!this.search_query) {
            return true;
          }
          const search_words = this.search_query.toLowerCase().split(' ').filter(w => w);
          if(search_words.length == 0) {
            return true;
          }
          const track_searchable = `${track.title} ${track.album} ${track.artist}`.toLowerCase();
          return search_words.every(w => track_searchable.includes(w));
        }).slice(0, 128);
      },
    },
  }
</script>

<template>
  <div id="library">
    <HeaderTextInput
      v-model="search_query"
      placeholder="Search"
    />
    <div id="tracks">
      <Track v-for="track in filtered_tracks" :track=track></Track>
      <div v-if="tracks.length == 0">No tracks in library</div>
      <div v-else-if="filtered_tracks.length == 0">No tracks match the words "{{ search_query }}"</div>
    </div>
  </div>
</template>
<style>
  #tracks {
    max-width: 512px;
    margin: auto;
    padding-top: 48px;
  }
</style>

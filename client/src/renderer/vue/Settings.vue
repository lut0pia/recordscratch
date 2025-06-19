<script>
  export default {
    props: [
      'state',
    ],
    async mounted() {
      const settings = await rs.get_settings();
      this.$refs.name.value = settings.name;
    },
    methods: {
      set_setting(key, value) {
        rs.set_setting(key, value);
      },
    },
  }
</script>
<template>
  <div id="settings">
    <setting>
      <label>Name: </label>
      <input ref="name" type="text" @keypress="$event.key == 'Enter' && set_setting('name', $event.target.value)" />
    </setting>
  </div>
</template>
<style>
  #settings {
    max-width: 512px;
    margin: auto;
  }
  setting input {
    width: 300px;
  }
</style>

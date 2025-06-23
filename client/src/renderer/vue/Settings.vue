<script>
  export default {
    props: [
      'state',
    ],
    data() {
      return {
        categories: {},
      };
    },
    async mounted() {
      const descriptions = await rs.get_setting_descriptions();
      for(let desc of Object.entries(descriptions)) {
        const category_name = desc[1].category;
        let category = this.categories[category_name];
        if(!category) {
          this.categories[category_name] = category = {};
        }
        category[desc[0]] = desc[1];
      }
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
    <div class="category" v-for="(settings, cat_name) in this.categories">
      <title>{{ cat_name }}</title>
      <div class="setting" v-for="(desc, setting_name) in settings">
        <label>{{setting_name}} </label>
        <input type="text"
          @keypress="$event.key == 'Enter' && set_setting(setting_name, $event.target.value)"
          :value="state.settings[setting_name]" />
      </div>
    </div>
  </div>
</template>
<style>
  #settings {
    max-width: 512px;
    margin: auto;
  }
  .category title {
    display: inline-block;
    font-weight: bold;
    text-transform: capitalize;
    padding: 10px 0px;
  }
  .setting input {
    width: 300px;
    height: 20px;
  }
  .setting label {
    display: inline-block;
    width: 150px;
    padding: 10px;
    text-transform: capitalize;
  }
</style>

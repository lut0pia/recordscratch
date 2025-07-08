<script>
  import { shared } from './shared.js'
  
  export default {
    props: [
      'name',
      'icon',
    ],
    methods: {
      select_panel(panel) {
        shared.current_panel = panel;
      },
    },
    computed: {
      current_panel() {
        return shared.current_panel;
      },
      title() {
        return this.name.charAt(0).toUpperCase() + this.name.slice(1);
      },
    },
  }
</script>
<template>
  <a class="header_button" :title="title" @click="select_panel(name)" :class="{active:current_panel == name}">{{icon}}</a>
</template>
<style>
  .header_button {
    display: inline-block;
    width: 50px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    border-radius: 10px;
    background-color: white;
    margin: 8px 0px 8px 8px;
  }
  .header_button:hover {
    cursor: pointer;
  }
  .header_button.active {
    background-color: grey;
  }
</style>

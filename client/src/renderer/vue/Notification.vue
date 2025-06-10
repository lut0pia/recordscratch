<script>
  export default {
    props: ['notification'],
    computed: {
      emoji() {
        return {
          log: 'ℹ',
          error: '⚠'
        }[this.notification.type] || '';
      },
    },
    async mounted() {
      this.$refs.notification.classList.add('highlight');
      this.$refs.notification.classList.add(this.notification.type)
      
      const display_time = {
        log: 2000,
        error: 5000
      }[this.notification.type] || 5000;
      setTimeout(() => {
        this.$refs.notification.classList.remove('highlight');
      }, display_time);
    }
  }
</script>
<template>
  <div class="notification highlight" ref="notification">
    {{emoji}} {{notification.text}}
  </div>
</template>
<style>
  .notification {
    display: none;
    font-size: 22px;
    border: 1px grey solid;
    border-radius: 5px;
    padding: 10px;
  }
  .notification.highlight {
    display: block;
  }
  .notification.error {
    background-color: lightcoral;
  }
</style>

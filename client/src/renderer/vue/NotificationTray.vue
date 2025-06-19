<script>
  import Notification from './Notification.vue';

  export default {
    components: {
      Notification,
    },
    data() {
      return {
        notifications: [],
      };
    },
    async mounted() {
      rs.on_notification((e, notification) => {
        this.notifications.push(notification);
      });
    }
  }
</script>
<template>
  <div id="notification_tray">
    <Notification v-for="notification in notifications" :notification=notification></Notification>
  </div>
</template>
<style>
  #notification_tray {
    position: absolute;
    bottom: 0px;
  }
</style>

<script>
  function hash(str) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  export default {
    props: ['users', 'user_id'],
    computed: {
      user_name() {
        const user = this.users[this.user_id];
        if(user && user.name) {
          return user.name;
        }
        return `Anon#${this.user_id}`;
      },
      user_pronouns() {
        const user = this.users[this.user_id];
        if(user && user.pronouns) {
          return user.pronouns;
        } else {
          return null;
        }
      },
      user_color() {
        const seed = hash(this.user_name);
        return `hsl(${seed % 360} 70% 50%)`;
      },
    },
  }
</script>

<template>
  <div>
    <span class="user_name">{{ user_name }}</span>
    <span v-if="user_pronouns" class="pronouns">{{ user_pronouns }}</span>
  </div>
</template>
<style>
  .user_name {
    font-weight: bold;
  }
  .pronouns {
    color: grey;
    font-size: 0.8em;
  }
  .pronouns::before {
    content: ' (';
  }
  .pronouns::after {
    content: ')';
  }
</style>

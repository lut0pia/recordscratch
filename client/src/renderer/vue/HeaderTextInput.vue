<script>
  export default {
    props: [
      'modelValue',
      'placeholder',
    ],
    emits: [
      'update:modelValue',
      'submit',
    ],
  }
</script>
<template>
  <div class="header_text_input">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
      @keypress="$event.key == 'Enter' && $emit('submit')"
    />
  </div>
</template>
<style>
  .header_text_input {
    width: 100%;
  }
  .header_text_input input {
    display: block;
    width: calc(min(512px, 100% - 32px));
    height: 28px;
    margin: 12px auto;
    padding: 2px 8px;
  }
</style>

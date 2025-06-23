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
      @keypress.enter="$emit('submit')"
    />
  </div>
</template>
<style>
  .header_text_input {
    position: sticky;
    top: 0px;
    width: 100%;
  }
  .header_text_input.bottom {
    bottom: 0px;
  }
  .header_text_input input {
    display: block;
    width: calc(min(512px, 100% - 20px));
    height: 28px;
    margin: 0px auto 10px auto;
    padding: 2px 8px;
  }
  .header_text_input.bottom input{
    margin: 10px auto 0px auto;
  }
</style>

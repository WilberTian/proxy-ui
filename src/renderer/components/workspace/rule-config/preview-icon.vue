<template>
  <i :class="classObject" @click="toggleIcon"></i>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: true
    },
    cb: {
      type: Function,
      default: () => {}
    }
  },
  computed: {
    classObject () {
      return {
        'el-icon-view': true,
        'disabled': !this.value
      }
    }
  },
  methods: {
    toggleIcon (e) {
      e.preventDefault()
      e.stopPropagation()
      if (this.cb) {
        this.cb(!this.value)
      }
      this.$emit('input', !this.value)
    }
  }
}
</script>

<style>
.el-icon-view {
  position: relative;
  cursor: pointer;
}
.el-icon-view.disabled::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 5px;
  height: 2px;
  width: 12px;
  background-color: #444;
  transform: rotate(45deg);
}
</style>

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
.el-icon-view.disabled {
  color: #606266;
}
.el-icon-view.disabled::after {
  content: '';
  position: absolute;
  top: 11px;
  left: 4px;
  height: 2px;
  width: 16px;
  background-color: #606266;
  transform: rotate(45deg);
}
</style>

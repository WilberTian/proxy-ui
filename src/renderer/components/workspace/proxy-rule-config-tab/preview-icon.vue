<template>
  <i :title="title" :class="classObject" @click="toggleIcon"></i>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
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

<style scoped>
.el-icon-view {
  position: relative;
  cursor: pointer;
}
.el-icon-view.disabled::after {
  content: '';
  position: absolute;
  top: 9px;
  left: 4px;
  height: 1px;
  background-color: #444;
  width: 14px;
  border-top: 1px solid #efefef;
  border-bottom: 1px solid #efefef;
  transform: rotate(45deg);
}
</style>

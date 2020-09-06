<template>
  <el-tooltip effect="dark" :content="content" :placement="placement" :disabled="disabled">
    <div ref="innerEl" :class="className">{{content}}</div>
  </el-tooltip>
</template>

<script>
export default {
  props: {
    content: {
      type: String
    },
    className: {
      type: String
    },
    placement: {
      type: String,
      default: 'bottom'
    }
  },
  data () {
    return {
      disabled: true
    }
  },
  mounted () {
    const el = this.$refs['innerEl']
    if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight) {
      this.disabled = false
    }
  }
}
</script>

<style>

</style>

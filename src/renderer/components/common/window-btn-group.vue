<template>
  <div class="window-btn-group" @mouseenter="setIconVisible(true)" @mouseleave="setIconVisible(false)">
    <div v-if="!disableClose" class="close-btn" @click="handleClose">
      <svgicon
          v-show="iconVisible"
          icon="close"
          width="12" height="12" color="#333"
        ></svgicon>
    </div>
    <div v-if="!disableMinimize" class="minimize-btn" @click="handleMinimize">
      <svgicon
          v-show="iconVisible"
          icon="minimize"
          width="12" height="12" color="#333"
        ></svgicon>
    </div>
    <div v-if="!disableMaximize" class="maximize-btn"  @click="handleMaximize">
      <svgicon
          v-show="iconVisible"
          icon="maximize"
          width="10" height="10" color="#333"
        ></svgicon>
    </div>
  </div>
</template>
  
<script>
import '@/assets/icons/close'
import '@/assets/icons/minimize'
import '@/assets/icons/maximize'

export default {
  name: 'window-btn-group',
  props: {
    disableClose: {
      type: Boolean,
      default: false
    },
    disableMinimize: {
      type: Boolean,
      default: false
    },
    disableMaximize: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      iconVisible: false
    }
  },
  methods: {
    handleClose () {
      this.$emit('close')
    },
    handleMinimize () {
      this.$emit('minimize')
    },
    handleMaximize () {
      this.$emit('maximize')
    },
    setIconVisible (visible) {
      this.iconVisible = visible
    }
  }
}
</script>

<style scoped>
.window-btn-group {
  display: flex;
}
.close-btn, .minimize-btn, .maximize-btn {
  margin: 0 4px;
  border-radius: 50%;
  height: 14px;
  width: 14px;
  line-height: 14px;
  text-align: center;
  cursor: pointer;
}
.close-btn {
  background-color: #FF5722;
}
.minimize-btn {
  background-color: #fba420;
}
.maximize-btn {
  background-color: #13ce66;
  transform: rotate(45deg);
}
.maximize-btn svg {
  padding: 2px;
}
</style>

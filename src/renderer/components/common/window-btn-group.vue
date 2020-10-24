<template>
  <div class="window-btn-group" @mouseenter="setIconVisible(true)" @mouseleave="setIconVisible(false)">
    <div v-if="!disableClose" class="icon-wrapper close-btn" @click="handleClose">
      <i class="el-icon-close" v-show="iconVisible" />
    </div>
    <div v-if="!disableMinimize" class="icon-wrapper minimize-btn" @click="handleMinimize">
     <i class="el-icon-minus" v-show="iconVisible" />
    </div>
    <div v-if="!disableMaximize" class="icon-wrapper maximize-btn"  @click="handleMaximize">
      <i class="el-icon-d-caret" v-show="iconVisible" />
    </div>
  </div>
</template>
  
<script>

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
  -webkit-app-region: no-drag;
}
.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 4px;
  border-radius: 50%;
  height: 14px;
  width: 14px;
  cursor: pointer;
  font-size: 10px;
  color: #444;
}
.close-btn {
  background-color: #FF5722;
}
.close-btn i {
  font-weight: bold;
}
.minimize-btn {
  background-color: #fba420;
}
.minimize-btn i {
  font-weight: bold;
}
.maximize-btn {
  background-color: #13ce66;
}
.maximize-btn i {
  transform: rotate(45deg);
  transform-origin: center center;
  font-size: 12px;
}

</style>

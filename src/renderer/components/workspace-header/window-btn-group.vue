<template>
  <div class="window-btn-group">
    <div class="close-btn" @click="handleClose">
      <svgicon
          icon="close"
          width="12" height="12" color="#333"
        ></svgicon>
    </div>
    <div class="minimize-btn" @click="handleMinimize">
      <svgicon
          icon="minimize"
          width="12" height="12" color="#333"
        ></svgicon>
    </div>
    <div class="maximize-btn"  @click="handleMaximize">
      <svgicon
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
  methods: {
    handleClose () {
      this.$ipcRenderer.send('window-close')
    },
    handleMinimize () {
      this.$ipcRenderer.send('window-minimize')
    },
    handleMaximize () {
      this.$ipcRenderer.send('window-maximize')
    }
  }
}
</script>

<style scoped>
.window-btn-group {
  width: 80px;
  display: flex;
  justify-content: space-around;
}
.close-btn, .minimize-btn, .maximize-btn {
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
  background-color: #FFEB3B;
}
.maximize-btn {
  background-color: #13ce66;
  transform: rotate(45deg);
}
.maximize-btn svg {
  padding: 2px;
}
</style>

<template>
  <div class="proxy-server-data">
    <div class="data-wrapper" v-if="Object.keys(hookData).length > 0">
      <div class="data-title">
        当前命中规则数据
      </div>
      <el-collapse accordion>
        <el-collapse-item v-for="guid in Object.keys(hookData)"
        :key="guid"> 
          <template slot="title">
            <div class="rule-config-matcher">
              {{hookData[guid].ruleConfig.matcher}}
            </div>
            <div class="rule-config-pattern">
              {{hookData[guid].ruleConfig.pattern}}
            </div>
            <div class="hit-data">
              命中 {{hookData[guid].count}} 次
            </div>
          </template>
          <div>{{hookData[guid].data}}</div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div
      class="no-data-msg"
      v-if="Object.keys(hookData).length === 0"
    >
      当前没有规则命中！
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      hookData: {}
    }
  },
  mounted () {
    this.timer = setInterval(() => {
      this.hookData = JSON.parse(JSON.stringify(this.$proxyApi.getHookData()))
    }, 1000)
  },
  beforeDestroy () {
    clearTimeout(this.timer)
  }
}
</script>

<style scoped>
.proxy-server-data .data-wrapper {
  padding: 10px;
}
.proxy-server-data .data-wrapper .data-title {
  height: 32px;
  line-height: 32px;
  font-size: 18px;
  font-weight: bold;
  color: #999;
  margin-bottom: 10px;
}
.el-collapse-item__header {
  position: relative;
  display: flex;
}
.el-collapse-item__header .rule-config-matcher {
  width: 80px;
}
.el-collapse-item__header .rule-config-pattern {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-emphasis: ellipse;
  color: #999;
}
.el-collapse-item__header .hit-data {
  height: 28px;
  padding: 0 8px;
  line-height: 28px;
  border-radius: 50%;
  color: #444;
}
.proxy-server-data .no-data-msg {
  padding-top: 40vh;
  text-align: center;
  height: 24px;
  line-height: 24px;
  font-size: 20px;
  font-weight: bold;
  color: #999;
}
</style>

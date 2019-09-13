<template>
  <el-form
    class="vconsole-config-form"
    :model="vconsoleConfigData"
    ref="vconsoleConfigForm"
    label-width="120px"
    size="mini"
  >
    <el-form-item
      prop="injected"
    >
      <span slot="label">
        vconsole注入
        <el-tooltip class="item" effect="dark" content="开启代理后，html页面中会自动注入vconsole" placement="bottom">
          <i class="el-icon-info"></i>
        </el-tooltip>
      </span>
      <el-radio-group v-model="vconsoleConfigData.injected">
        <el-radio :label="true">开启</el-radio>
        <el-radio :label="false">不开启</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="saveVconsoleConfig"
      >确认</el-button>
      <el-button @click="() => {this.$emit('cancelVconsoleConfig')}">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data () {
    return {
      vconsoleConfigData: {...this.vconsoleConfig}
    }
  },
  beforeCreate () {
    this.vconsoleConfig = this.$proxyApi.readVconsoleConfig()
  },
  methods: {
    saveVconsoleConfig () {
      this.$proxyApi.writeVconsoleConfig(this.vconsoleConfigData)
      this.$emit('cancelVconsoleConfig')
    }
  }
}
</script>

<style>
</style>

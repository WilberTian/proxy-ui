<template>
  <el-form
    class="weinre-config-form"
    :model="weinreConfigData"
    ref="weinreConfigForm"
    label-width="120px"
    size="mini"
  >
    <el-form-item>
      <el-button
        type="primary"
        @click="startWeinre"
        v-if="weinreServerStatus === 0"
      >开启weinre</el-button>
      <el-button v-if="weinreServerStatus === 1" @click="stopWeinre">关闭weinre</el-button>
      <el-button @click="() => {this.$emit('cancelWeinreConfig')}">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      weinreConfigData: {}
    }
  },
  computed: {
    ...mapGetters({
      weinreServerStatus: 'getWeinreServerStatus'
    })
  },
  methods: {
    startWeinre () {
      this.$proxyApi.startWeinre().then((data) => {
        this.$notify({
          title: '提示',
          message: data,
          type: 'success'
        })
        this.$store.commit('setWeinreServerStatus', 1)
      }, (e) => {
        console.log(e)
      })
    },
    stopWeinre () {
      this.$proxyApi.stopWeinre()
    }
  }
}
</script>

<style>
</style>

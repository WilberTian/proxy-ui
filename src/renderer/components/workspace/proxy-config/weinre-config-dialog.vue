<template>
  <el-form
    class="weinre-config-form"
    :model="weinreConfigData"
    :rules="validators"
    ref="weinreConfigForm"
    label-width="120px"
    size="mini"
  >
    <el-form-item
      label="weinre端口"
      prop="port"
      
    >
      <el-input v-model.number="weinreConfigData.port" :disabled="weinreServerStatus === 1"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="startWeinre('weinreConfigForm')"
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
    const isValidPort = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请填写weinre端口'))
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('请输入数字值'))
        } else {
          if (value <= 1024) {
            callback(new Error('请输入大于1024的数字'))
          }
          callback()
        }
      }, 500)
    }

    return {
      weinreConfigData: {...this.weinreConfig},
      validators: {
        port: [
          { validator: isValidPort, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters({
      weinreServerStatus: 'getWeinreServerStatus'
    })
  },
  watch: {
    weinreConfigData: {
      deep: true,
      handler (val) {
        this.$proxyApi.writeWeinreConfig(val)
      }
    }
  },
  beforeCreate () {
    this.weinreConfig = this.$proxyApi.readWeinreConfig()
  },
  methods: {
    startWeinre (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$proxyApi.startWeinre().then((data) => {
            this.$emit('cancelWeinreConfig')
            this.$notify({
              title: '提示',
              message: data,
              type: 'success'
            })
            this.$store.commit('setWeinreServerStatus', 1)
          }, (e) => {
            console.log(e)
          })
        } else {
          return false
        }
      })
    },
    stopWeinre () {
      this.$proxyApi.stopWeinre().then((data) => {
        this.$emit('cancelWeinreConfig')
        this.$notify({
          title: '提示',
          message: data,
          type: 'success'
        })
        this.$store.commit('setWeinreServerStatus', 0)
      }, (e) => {
        console.log(e)
      })
    }
  }
}
</script>

<style>
</style>

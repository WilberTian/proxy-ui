import Vue from 'vue'
import { ruleTypeMapper } from '@/configs/constants'

Vue.filter('ruleTypeConvertor', function (value) {
  return ruleTypeMapper[value]
})

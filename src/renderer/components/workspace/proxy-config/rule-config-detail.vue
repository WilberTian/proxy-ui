<template>
  <div class="rule-config-detail-wrapper">
    <div class="rule-config-type">
      {{ruleConfig.type}}
    </div>
    <div class="rule-config-detail">
      <div class="rule-config-item" v-if="ruleConfig.type !== 'customize'">
        <div class="label">
          URL匹配规则
        </div>
        <div class="value">【{{ruleConfig.matcher}}】 {{ruleConfig.pattern}}</div>
      </div>
      <div class="rule-config-item" v-if="ruleConfig.type === 'request' && ruleConfig.type !== 'customize'">
        <div class="label">
          请求头
        </div>
        <div class="value">{{ruleConfig.header}}</div>
      </div>
      <div class="rule-config-item" v-if="ruleConfig.type === 'request' && ruleConfig.type !== 'customize'">
        <div class="label">
          请求内容
        </div>
        <div class="value">{{ruleConfig.body}}</div>
      </div>
      <div class="rule-config-item" v-if="(ruleConfig.type === 'mock' || ruleConfig.type === 'response') && ruleConfig.type !== 'customize'">
        <div class="label">
          HTTP状态码
        </div>
        <div class="value">{{ruleConfig.response.statusCode}}</div>
      </div>
      <div class="rule-config-item" v-if="(ruleConfig.type === 'mock' || ruleConfig.type === 'response') && ruleConfig.type !== 'customize'">
        <div class="label">
          响应头
        </div>
        <div class="value">{{ruleConfig.response.header}}</div>
      </div>
      <div class="rule-config-item" v-if="(ruleConfig.type === 'mock' || ruleConfig.type === 'response') && ruleConfig.bodyType === 'string' && ruleConfig.type !== 'customize'">
        <div class="label">
          响应内容
        </div>
        <div class="value">{{ruleConfig.bodyContent}}</div>
      </div>
      <div class="rule-config-item" v-if="(ruleConfig.type === 'mock' || ruleConfig.type === 'response') && ruleConfig.bodyType === 'file' && ruleConfig.type !== 'customize'">
        <div class="label">
          响应内容
        </div>
        <div class="value">{{ruleConfig.bodyPath}}</div>
      </div>
      <div class="rule-config-item" v-if="ruleConfig.type === 'customize'">
        <div class="label">
          自定义规则名称
        </div>
        <div class="value">{{ruleConfig.name}}</div>
      </div>
      <div class="rule-config-item" v-if="ruleConfig.type === 'customize'">
        <div class="label">
          自定义规则描述
        </div>
        <div class="value">{{ruleConfig.description}}</div>
      </div>
      <div class="rule-config-item" v-if="ruleConfig.type === 'customize'">
        <div class="label">
          自定义规则
        </div>
        <div class="value">{{ruleConfig.customizeRule}}</div>
      </div>
      <div class="rule-config-item" v-if="ruleConfig.tags.length > 0">
        <div class="label">
          标签
        </div>
        <div class="value">
          <div class="rule-config-tag" v-for="(tag, idx) in ruleConfig.tags" :key="idx">{{tag}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    ruleConfig: {
      type: Object
    }
  }
}
</script>
<style scoped>
.rule-config-detail-wrapper {
  position: relative;
}
.rule-config-type {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #333;
  opacity: .7;
  color: #fff;
  height: 22px;
  line-height: 22px;
  width: 80px;
  text-align: center;
  border-bottom-left-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
.rule-config-item {
  display: flex;
  font-size: 13px;
  margin: 12px 8px;
  opacity: .8;
  color: #333;
}
.rule-config-item .label {
  width: 100px;
  padding-right: 8px;
  font-weight: bold;
  word-wrap: break-word;
  word-break: break-all;
}
.rule-config-item .value {
  flex: 1;
  padding-left: 8px;
  white-space: pre-wrap;
  border-left: 1px solid #ccc;
  overflow: hidden;
}
.rule-config-tag {
  display: inline-block;
  height: 18px;
  line-height: 18px;
  padding: 0 4px;
  margin: 4px;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  background-color: rgba(64,158,255,.6);
}
</style>

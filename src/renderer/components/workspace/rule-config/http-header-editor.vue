<template>
  <el-tabs type="border-card">
    <el-tab-pane label="键/值">
      <div class="table-wrapper">
        <div class="table-header">
          <div class="header-item col4">
            键
          </div>
          <div class="header-item col5">
            值
          </div>
          <div class="header-item col1">
            <el-button type="primary" size="mini" icon="el-icon-plus" circle @click="addHeaderItem"></el-button>
          </div>
        </div>
        <div v-if="typeof httpHeader === 'string'">
          非法的JSON
        </div>
        <div v-else>
          <div v-for="(row, idx) in rows" :key="idx" class="table-row">
            <div class="row-item col4">
              <el-autocomplete
                class="autocomplete-input"
                v-model="row.key"
                :fetch-suggestions="queryHttpHeaderKeys"
                @blur="triggerChangeEvent"
              ></el-autocomplete>
            </div>
            <div class="row-item col5">
              <el-input
                v-model="row.value"
                :disabled="row.key === ''"
                @blur="triggerChangeEvent"
              ></el-input>
            </div>
            <div class="row-item col1">
              <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="deleteHeaderItem(idx)"></el-button>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="JSON">
      <el-input
        type="textarea"
        :rows="4"
        :value="formatedHttpHeader"
        @input="headerTextChange"
        @keydown.native="handleTabClick"
      ></el-input>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { httpHeaderKeys } from '@/configs/constants'

export default {
  props: {
    httpHeader: {
      type: Object | String
    }
  },
  data () {
    return {
      rows: [],
      formatedHttpHeader: ''
    }
  },
  watch: {
    httpHeader: {
      deep: true,
      immediate: true,
      handler (val) {
        if (val && typeof val === 'object') {
          this.formatedHttpHeader = JSON.stringify(val, null, 4)
          const keys = Object.keys(val)
          if (keys.length > 0) {
            this.rows = keys.map((key) => {
              return {
                key,
                value: val[key]
              }
            })
            return
          }
        }

        this.formatedHttpHeader = val
        this.rows = [{
          key: '',
          value: ''
        }]
      }
    }
  },
  methods: {
    queryHttpHeaderKeys (queryString, cb) {
      const results = queryString ? httpHeaderKeys.filter((headerKey) => {
        return headerKey.toLowerCase().indexOf(queryString.toLowerCase()) > -1
      }) : []
      const options = results.map((result) => {
        return {
          key: result,
          value: result
        }
      })
      cb(options)
    },
    addHeaderItem () {
      this.rows.push({
        key: '',
        value: ''
      })
    },
    deleteHeaderItem (idx) {
      this.rows.splice(idx, 1)
      this.triggerChangeEvent()
    },
    triggerChangeEvent () {
      const headerObj = {}
      this.rows.forEach((row) => {
        if (row.key !== '') {
          headerObj[row.key] = row.value
        }
      })

      this.$emit('change', headerObj)
    },
    headerTextChange (val) {
      let result
      try {
        result = JSON.parse(val)
      } catch (e) {
        result = val
      }
      this.$emit('change', result)
    },
    handleTabClick (e) {
      if (e.keyCode === 9) {
        e.preventDefault()
        e.stopPropagation()
        const indent = '    '
        const start = e.target.selectionStart
        const end = e.target.selectionEnd
        let selected = window.getSelection().toString()
        selected = indent + selected.replace(/\n/g, '\n' + indent)
        e.target.value = e.target.value.substring(0, start) + selected + e.target.value.substring(end)
        e.target.setSelectionRange(start + indent.length, start + selected.length)
        this.$nextTick(() => {
          this.formatedHttpHeader = e.target.value
        })
      }
    }
  }
}
</script>
<style scoped>
.table-wrapper {
  border: 1px solid #d7d7d7;
}
.table-header {
  background-color: #efefef;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
.table-header, .table-row {
  display: flex;
  padding: 4px;
}
.header-item, .row-item {
  padding: 4px 8px;
}
.col1 {
  width: 10%;
}
.col2 {
  width: 20%;
}
.col4 {
  width: 40%;
}
.col5 {
  width: 50%;
}
.autocomplete-input {
  width: 100%;
}
</style>

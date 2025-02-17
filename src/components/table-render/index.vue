<script>
export default {
  name: 'Table',
  props: {
    tableData: {
      type: Array,
      default: () => ([])
    },
    tableColumns: {
      type: Array,
      default: () => ([])
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    emptyBtnText: {
      type: String,
      default: null
    },
    emptyBtnIcon: {
      type: String,
      default: null
    },
    expandKey: {
      type: String,
      default: null
    },
    page: {
      type: Number,
      default: null
    },
    limit: {
      type: Number,
      default: null
    },
    total: {
      type: Number,
      default: null
    }
  },
  methods: {
    isCustomColumn (column) {
      return (
        column.type && !['text', 'index', 'selection'].includes(column.type)
      )
    },
    getColumnType (column) {
      if (
        ['expand', 'index', 'selection'].includes(column.type) ||
        column.prop !== this.expandKey
      ) {
        return column.type
      }
      return undefined
    },
    getAlign (column) {
      if (column.align) return column.align
        return column.type === 'index' ? 'center' : undefined
    },

    getIndex (row, column, cellValue, index) {
      return index + 1
    },

    getFormatter (column) {
      if (column.formatter) return column.formatter
      if (column.type === 'index') return this.getIndex
      return (row, column, cellValue, index) => {
        return cellValue || cellValue === 0 ? cellValue : '-'
      }
    },

    renderTableItem (column) {
      const name = column.headerKey || 'header' + column.prop
      const scopedSlots = {}
      if (column.headerType === 'slot' && this.$scopedSlots[name]) {
        scopedSlots.header = () => this.$scopedSlots[name]?.()
      }
      if (this.isCustomColumn(column)) {
        scopedSlots.default = (scope) => {
          return this.$scopedSlots[column.prop]?.(scope)
        }
      }
      if (Array.isArray(column.child)) {
        return (
          <el-table-column
            scopedSlots={scopedSlots}
            {...{ attrs: column }}
            type={this.getColumnType(column)}
            align={this.getAlign(column)}
            formatter={this.getFormatter(column)}
          >
            {column.child.map(item => this.renderTableItem(item))}
          </el-table-column>
        )
      }
      return (
        <el-table-column
          scopedSlots={scopedSlots}
          {...{ attrs: column }}
          type={this.getColumnType(column)}
          align={this.getAlign(column)}
          formatter={this.getFormatter(column)}
        />
      )
    },

    renderTable () {
      // const img = require('xxxxx.png')
      const slots = {
        empty: () => {
          if (this.$slots.empty) return this.$slots.empty()
          return (
            <div class="table-empty">
              {/* <img src={img} /> */}
              <p>{this.emptyText}</p>
              {
                this.emptyBtnText ?
                (
                  <el-button
                    icon={this.emptyBtnIcon}
                    onClick={this.emptyBtnClick}
                    class="empty-btn"
                    type="primary"
                  >
                  </el-button>
                ) : undefined
              }
            </div>
          )
        }
      }
      if (this.$scopedSlots.append) {
        slots.append = () => this.$scopedSlots.append()
      }
      return (
        <div class="table">
          <el-table
            scopedSlots={slots}
            data={this.tableData}
            tooltip-effect="light"
            ref="table"
            {...{ on: this.$listeners, attrs: this.$attrs }}
          >
            <div slot="append"></div>
            {this.tableColumns.map(column => this.renderTableItem(column))}
          </el-table>
          {
            this.page && this.limit && this.total ?
            (
              <el-pagination
                page={this.page}
                limit={this.limit}
                total={this.total}
                {...{ on: this.$listeners }}
              >
              </el-pagination>
            ) : undefined
          }
        </div>
      )
    },
    emptyClick () {
      this.$emit('empty-btn-click')
    },
    doLayout () {
      if (!this.$refs.table) return
      return this.$refs.table.doLayout
    }
  },
  render () {
    return this.renderTable()
  }
}
</script>

<template>
  <div class="line-clamp-container" :style="{height: style.containerHeight}">
    <div :style="{height: style.pseudoElementHeight}"></div>
    <div class="line-clamp-ellipsis" v-if="isCutting && isCollapse" @click="hanldeisCollapse(false)">
      <slot name="ellipsis">{{ ellipsis }}</slot>
      <el-link>
        <i class="el-icon-d-arror-right arrow-icon"></i>展开
      </el-link>
    </div>
    <div ref="content" class="line-clamp-content" :style="{marginTop: `-${style.offsetHeight}`}">
      {{ content }}
      <el-link v-if="isCutting && !isCollapse" @click="handleisCollapse(true)">
        <i class="el-icon-d-arror-left arrow-icon"></i>收起
      </el-link>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'LineClamp',
    props: {
      content: String,
      row: {
        type: Number,
        default: 3
      },
      ellipsis: {
        type: String,
        default: '...'
      }
    },
    data () {
      return {
        collapseContainerHeight: null,
        isCollapse: false,
        isCutting: false,
        timer: null,
        style: {
          containerHeight: 'auto',
          pseudoElementHeight: 0,
          offsetHeight: 0
        }
      }
    },
    watch: {
      content: {
        immediate: true,
        handle (val) {
          if (!val) return
          this.$nextTick(this.handleCutting)
        }
      }
    },
    mounted () {
      window.addEventListener('resize', () => {
        if (this.timer) {
          clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
          this.handleCutting()
        }, 300)
      }, false)
    },

    methods: {
      handleCutting () {
        this.cutting = false
        const style = window.getComputedStyle(this.$refs.content)
        const contentEl = this.clearPX(style.getPropertyValue('height'))
        const fontSize = this.clearPX(style.getPropertyValue('font-size'))
        let lineHeight = style.getPropertyValue('line-height')
        if (lineHeight === 'normal') {
          lineHeight = fontSize * 1.33
        } else {
          lineHeight = this.clearPX(lineHeight)
        }
        this.collapseContainerHeight = lineHeight * this.row + 'px'
        const rowHeight = lineHeight * (this.row - 1)
        this.style.pseudoElementHeight = rowHeight + 'px'
        this.style.offsetHeight = rowHeight - (lineHeight - fontSize) / 2 + 'px'

        if (contentEl > lineHeight * this.row) {
          this.isCutting = true
          this.isCollapse = true
          this.style.containerHeight = this.collapseContainerHeight
        }
      },
      handleisCollapse (isCollapse) {
        this.isCollapse = isCollapse
        this.style.containerHeight = this.isCollapse ? this.collapseContainerHeight : 'auto'
      },
      clearPX (str) {
        return +str.replace(/px/g, '')
      }
    }
  }
</script>

<style lang="less" scoped>
  .line-clamp-container {
    overflow: hidden;

    .line-clamp-ellipsis {
      float: right;
    }
    .line-clamp-content {
      white-space: pre-wrap;
    }
    .arrow-icon {
      transform: rotate(90deg);
    }
  }
</style>

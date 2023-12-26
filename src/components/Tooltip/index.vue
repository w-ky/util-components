<template>
  <el-tooltip effect="light" :disabled="disabled" v-bind="$attrs">
    <template #content><slot name="content"></slot></template>
    <div ref="tooltipContent" :class="{textOverflow: row === 1}" :style="lineStyle">
      <slot></slot>
    </div>
  </el-tooltip>
</template>

<script>
  import { isIE } from '@/utils/files'

  export default {
    name: 'Tooltip',
    props: {
      tooltipStyle: {
        type: [Object, String],
        default: () => ({})
      },
      row: {
        type: Number,
        default: 1
      }
    },

    data () {
      return {
        disabled: false
      }
    },

    computed: {
      lineStyle ({ tooltipStyle }) {
        if (typeof tooltipStyle === 'string') return tooltipStyle
        return Object.assign({
          maxWidth: '100%'
        }, tooltipStyle)
      }
    },

    mounted () {
      this.handleTipDisable()
    },

    methods: {
      handleTipDisable () {
        const tooltipContent = this.$refs.tooltipContent
        if (this.row === 1) {
          this.handleOneLine(tooltipContent)
        } else {
          this.handleMoreLine(tooltipContent)
        }
      },
      
      handleOneLine (tooltipContent) {
        this.$nextTick(() => {
          if (!tooltipContent) return
          let childrenWidth = 0
          if (isIE()) {
            tooltipContent.style.overflow = 'visible'
            let range = document.createRange()
            range.setStart(tooltipContent, 0)
            range.setEnd(tooltipContent, tooltipContent.childNodes.length)
            childrenWidth = range.getBoundingClientRect().width
            range = null
            tooltipContent.style.overflow = 'hidden'
          } else {
            childrenWidth = this.$slots.default[0].elm.offsetWidth
          }
          this.disabled = childrenWidth <= tooltipContent.offsetWidth
        })  
      },

      handleMoreLine (tooltipContent) {
        if (!tooltipContent) return
        const textWidth = 14 // 字体大小
        const textHeight = 18 // 字体行高
        const ellipseWidth = 1 // 省略号高度
        const { offsetWidth: contentWidth, offsetHeight: contentHeight, innerHTML: text } = tooltipContent
        if (Math.floor(contentHeight / textHeight) > this.row) {
          this.disabled = false
          const splitTxtCount = Math.floor((contentWidth * this.row) / textWidth) - ellipseWidth
          const splitTxt = text.slice(0, splitTxtCount) + '...'
          tooltipContent.innerHTML= splitTxt
        } else {
          this.disabled = true
        }
      }
    }
  }
</script>

<style scoped>
  .text-overflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

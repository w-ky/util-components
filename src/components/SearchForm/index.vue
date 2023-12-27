<script>
import ZipSelect from '@/components/ZipSelect'
import AppInputPro from '@/components/AppInputPro'
import ZipTokenComponent from '@/components/ZipTokenComponent'

const COMP={
  'hi-select':ZipSelect,
  'zip-input-pro':AppInputPro,
  'token-component':ZipTokenComponent
}
export default {
  name:'SearchForm',
  props:{
  //  搜索方法
  search:Function,
  // 重置方法
  reset:Function,
  // 初始化列表数据
  model:{
    type:Object,
    default:()=>({})
  },
  config:{
    required:true,
    type:Array,
     default:()=>[]
  }
  
  },

  data() {
    return {
      formData: {},
      formItems:[],
      packup:true,
      isLine:false//是否单行
    };
  },
  watch:{
    model:{
      immediate:true,
      deep:true,
      handler(model){
      this.formData={...model}
      }
    },
    config(val){
     this.setIsLine()
    }
  },
  computed:{
    labelWidth(){
      let labelWidth=''
      if(!this.packUp){
        // 获取最长的label的宽
        const MaxLabelLen=Math.max(...this.config.map(item=>item.label.length))
        // 最长文字+冒号+em
        labelWidth=MaxLabelLen+1+'em'
      }
      return labelWidth
    }
  },
  created(){
    this.setIsLine()
  },
  render(h){
    return this.createElForm(h)
 },
  methods: { 
  //  设置是否单行
  setIsLine(){
    const itemCount=this.config.length
    const is1280DevicePixelRatio=window.devicePixelRatio>=1.5
    // 数量大于三个并且是1280分辨率或者数量大于四个大于1280分辨率
    const showPickUpBtn=(itemCount>3&&is1280DevicePixelRatio)||(itemCount>4&&   !is1280DevicePixelRatio)
    this.isLine=!showPickUpBtn
  },
  // 创建搜索重置按钮
  createSubmit(h){
    const submit=[]
    if(this.search){
      submit.push(h('el-button',{
        props:{type:'primary'},
        style:{marginBottom:'16px'},
        on:{
          click:()=>{this.search(this.formData)}
        }

      },'搜索'))
    }
    if(this.reset){
      submit.push(h('el-button',{
        style:{marginBottom:'16px'},
        class:'del-btn',
        on:{
          click:()=>{
            this.formData={}
            this.reset(this.formData)
          }
        }
      },'重置'))
    }
    // 自定义按钮
    if(this.$scopedSlots.customBtn){
      submit.push(h('span',this.$scopedSlots.customBtn({
        isLine:this.isLine,
        packUp:this.packUp
      })))
    }
    // 展开收起按钮
    if(!this.isLine){
      submit.push(h('span',{
        class:'color-blue m-l-8 cursor-pointer',
        on:{
          click:()=>{
            this.handleExpand()
          }
        }
      },
      [h('i',{class:'`el-icon-d-arrow-${this.packUp ? 'right' : 'left' }arrow-icon`'}),this.packUp?'展开':'收起'
      ]))
    }
    return h('span',{style:{whiteSpace:'nowrap'}},submit)
  },
  // 创建components
  createComponents(type,components){
    if(components)return components
    return COMP[type]||type
   },
  //  创建
  createElForm(h){
    // 如果当前不止一行，并且是收起状态，只展示四个筛选条件
    // 是否是1280分辨率
    const is1280DevicePixelRatio=window.devicePixelRatio>=1.5
    const isSmallSize=this.$Hi.size==='mini'||is1280DevicePixelRatio
    const size=isSmallSize?3:4
    const isSliceCount=!this.isLine&&this.packUp
    const sliceCount=isSliceCount?size:this.config.length
    const formItems=this.config.slice(0,sliceCount)

    return formItems.map(item=>{
      const {type,components,contentAttrs={},...formItemProp}=item
      const {className={},style={},...attrs}=contentAttrs
      return h('el-form-item',
      {props:formItemProp},
      [
        h(this.createComponents(type,components),{
          attrs:{value:this.formData[formItemProp.prop],clearable:true,...attrs},
          style:{maxWidth:'220px',...style},
          class:{...className},
          on:{
            input:(value)=>{
              this.$set(this.formData,formItemProp.prop,value)
              this.$emit('input',{...item,value})
            },
            change:(value)=>{
              this.$emit('change',{...item,value})
            }
          }
        })
      ])
    })
  },
  // 创建el-form
  createElForm(h){
    const children=this.createFormItem(h).concat(this.createSubmit(h))
    const props={
      model:this.formData,
      labelSuffix:':',
      labelWidth:this.labelWidth,
      inline:!this.isLine,
      ...this.$attrs
    }
    if(this.labelWidth){
      props.labelWidth=this.labelWidth
    }
    return h('el-form',{
      props,
      class:{singleline:this.isLine,'search-form':true},
      nativeOn:{
        keyup:(e)=>{
          if(e.key==='Enter'){
            this.search(this.formData)
          }
        }
      }
    },
    children
    )
  },
  handleExpand(){
    this.packUp=!this.packUp
  }

  },
};
</script>

<style lang="less" scoped>
.singleline{
  display:flex;
  align-items:center;
  :deep(.el-form-item){
    align-items:center
  }
}
:deep(.el-form-item){
  margin-right:16px;
  margin-bottom:16px
}
:deep(.el-form-item__content){
  flex:none;
}
.arrow-icon{
  transform:rotate(90deg);
}
.cursor-pointer{
  cursor:pointer;
}
/* select比input宽的问题 */
:deep(.el-select){
  width:100%;
  .el-input__inner{
    padding-right:30px;
  }
}
</style>

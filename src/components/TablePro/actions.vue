<script>
  // 表格中按钮操作处理
  import {cloneDeep}from 'lodash'
  import {MessageBox,Message}from '@element/ui'
// 创建操作按钮
function createButton(bts,h,scope){
  return bts.map(item=>{
    const {type,action,click,confirmTitle,directives,...p}=item
    const tetx=typeof action ==='function' ? action(scope):action
    if(type==='delete'){
      return h('el-button',{
        style:{padding:0}//,el-button会将表格行撑高，这里单独给样式
        on:{
          click(){
            // 弹出二次确认框
            MessageBox.confirm(confirmTitle||'确认删除当前行？','提示',{
              confirmButtonText:'确定',
              cancelButtonText:'取消',
              cancelButtonClass:'cancel-btn',
              type:'question'
            })
            .then(()=>{
              click(scope)
            })
            .catch(()=>{
              Message({
                type:'info',
                message:'已取消删除'
              })
            })
          }
        },
        props:{type:'text',...p},
        directives 
      },text)
    }
    // 创建按钮
    return type==='components' ?p.components:h('el-link',{
      props:{...p},
      on:{
        click(e){
          e.stopPropagation()
          click(scope)
        }
      },
      directives//自定义指令
    },action)
  })
}
// 创建更多按钮
function createDropdown(bts,h,scope){
  return h('el-dropdown',{style:{margin:0}},[
    h('el-link',{props:{underline:false}},'更多'),
    h('el-dropdown-menu',{slot:'dropdown'},[
      ...bts.map((item,i)=>{
        const {type,action,...p}=item
        const text=typeof action ==='function' ? action(scope) : action
        return h('el-dropdown-menu',
        {
          nativeOn:{
            click:(e)=>{
              e.stopPropagation()
              if(item.disabled)return
              p.click(scope)
            }
          }
        },
        [type==='components' ? p.components : h('el-link',{props:{...p}},text)])
      })
    ])
  ])
}
export default {
  name :'Actions',
  functional:true,
  render(h,{props}){
    let btns=[]
    const {actions,scope}=props
    const newActions=typeof actions==='function' ? actions (scope) : cloneDeep(actions)
    // 三个内按钮
    if(newActions.length<=3){
      btns=createButton(newActions,h,scope)
    }else{
      // 三个以上按钮
      const more=newActions.splice(0,2)
      btns=createButton(more,h,scope)
      // 从第二个按钮开始收集到更多中
      const moreBtn=createDropdown(newActions,h,scope)
      btns.push(moreBtn)
    }
    // 在每个按钮之间插入分割线组件
    const divider=h('el-divider',{props:{direction:'vertical'}})
    const result =btns.reduce((r,a)=>r.concat(a,divider),[divider])
    return h('div',{style:{dispaly:'flex',alignItems:'center',justifyContent:'flex-start',whiteSpace:'nowrap'}},result.slice(1,-1))
  }
}
</script>
<style lang="less" scoped>
:deep(.el-popover__reference-wrapper){
  margin:0 !important;
}
</style>

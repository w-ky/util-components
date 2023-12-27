<template>
  <el-container v-loading="tableLoading">
    <el-main class="APP-TABLE-PRO__MAIN">
      <el-table
      :data="tableData"
      tooltip-effect="light"
      v-bind="$attrs"
      v-on="$listeners"
      ref="tablePro"
      >
      <template #empty v-if="isNoData">
        <!-- 空插槽 -->
        <slot name="empty"/>
        <hi-result icon="no-data" title="暂无数据"/>
      </template>

      <template v-for="(item,index) in tableColumns">
        <!-- 操作按钮 -->
       <el-table-column
        v-if="item.type==='operat'"
        :key="item.type"
        fixed="right"
        class-name="operat-column"
        :width="handleOperatColumnWidth(item)"
        v-bind="item">
        <!-- 自定义表头 -->
        <template #header="{row,column,$index}">
          <slot :name="item.headerSlot" :scope="{row,column,$index}">
            <span :class="{'table-col-header' :isShowMoreBtn(index)}">
              {{column.lable}}
              <el-button type="text" @click="handleMore" v-if="isShowMoreBtn(index)">
                {{more ?'收到'：'展开'}}
                <i :class="[more ? 'hi-icon-left' : 'hi-icon-right']"></i>
              </el-button>
            </span>
          </slot>
        </template>
        <template slot-scope="{row,column,$index}">
          <Actions v-if="item.actions" :actions="item.actions" :scope="{row,column,$index}"/>
          <slot v-else name="operat" :scope="{row,column,$index}"></slot>
        </template>
       </el-table-column>
       <el-table-column
       v-else-if="['selection','index'].includes(item.type)"
       :key="index"
       :show-overflow-tooltip="showOverflowTooltip(item)"
       :width="item.width || '40px'"
       v-bind="item">
       <!-- 自定义表头 -->
        <template #header="{row,column,$index}">
          <slot :name="item.headerSlot" :scope="{row,column,$index}">
            {{column.lable}}
          </slot>
        </template>   

       </el-table-column>
       <el-table-column
        v-else
        :key="item.prop"
        :show-overflow-tooltip="showOverflowTooltip(item)"
        v-bind="slotBind(item)"
       >
         <!-- 自定义表头 -->
         <template #header="{row,column,$index}">
          <slot :name="item.headerSlot" v-bind="{row,column,$index}">
            <span :class="{'table-col-header' :isShowMoreBtn(index)}">
              {{column.lable}}
              <el-button type="text" @click="handleMore" v-if="isShowMoreBtn(index)">
                {{more ?'收到'：'展开'}}
                <i :class="[more ? 'hi-icon-left' : 'hi-icon-right']"></i>
              </el-button>
            </span>
          </slot>
        </template> 
        <template slot-scope="{row,column,$index}">
          <!-- 插槽 -->
          <template v-if="item.slot">
             <slot :name="item.slot" :scope="{row,column,$index}">
               {{(item.format ? item.format(row[item.prop],item,row):row[item.prop])||'-'}}
             </slot>
          </template>
          <!-- 展示 -->
          <template v-else>
            {{(item.format ? item.format(row[item.prop],item,row):row[item.prop])||'-'}}
          </template>
        </template> 
       </el-table-column>
      </template>       
      </el-table>
    </el-main>
    <el-footer v-if="isPagin && paginProps.total" class="footer">
      <slot name="footerLeft"></slot>
      <app-pagination
       :total="paginProps.total"
       :pageNum.sync="paginProps.pageNum"
       :pageSize.sync="paginProps.pageSize"
       v-bind="paginAttrs"
       @change="handlePaginChang"
      />
    </el-footer>
  </el-container>
</template>

<script>
import {debounce} from 'lodash'
import Actions from './actions'
export default{
  name:'AppTablePro',
  components:{
    Actions
  },
  props:{
    // 列表数据(传了data将不会再调用fetch请求数据方法)
    data:Array,

    // 列表加载数据方法
    fetch:{
      type:Function,
      default:function(){}
    },
    column:{
      type:Array,
      required:true,
      default:()=>[]
    },

    // 是否自动请求数据
    autoLoad:{
      type:Boolean,
      default:true
    },
    // 不确定的表头，展开收起功能，传入初始化加载的列数
    indeterminableHead:{
      type:[Boolean,Number],
       default:true
    },
    // 是否分页
    isPagin:{
      type:Boolean,
       default:true
    },
     // 是否分页
    paginationAttrs:{
      type:Object,
       default:()=>({})
    },
    isNoData:{
      type:Boolean,
       default:true
    }
    

  },
  data(){
    return{
      tableData:[],
      tableColumns:[],
      more:true,
      tableLoading:false,
      paginProps:{},
      paginAttrs:{}
    }
  },
  watch:{
    data:{
      immediate:true,
      deep:true,
      handler(tableData){
        if(!tableData)return
        this.tableData=tableData
        this.paginProps.total=tableData.length
      }
    },
    columns:{
       immediate:true,
      deep:true,
      handler(columns){
       if(!columns)return
       this.handleMore
      }
    }
  },
  computed:{
    isShowMoreBtn({tableColumns,indeterminableHead}){
      return (index)=>indeterminableHead && tableColumns.length-1===index
    }
  },
  created(){
    // 初始化分页器
    this.initPaginationAttrs()
  },
  mounted(){
    //  获取数据
    if(this.autoLoad)this.getTableData()
    window.addEventListener('resize',this.doLayout)
    this.$on('hook:beforeDestroy',()=>{
      window.removeEventListener('resize',this.doLayout)
    })
  },
  methods:{
    // 操作列宽度
    handleOperatColumnWidth(item){
      // 自定义头部宽度写死80
      if(item.headerSlot)return (item.width===undefined||item.width)?item.width:'100px'
      if(item.width){
        return item.width
      }
      if(item.actions){
        const actions=item.actions()||[]
        const btnStrs=actions.reduce((prev,item=>prev+item.action,''))//总共按钮文字
        const dividerWidth=(actions.length-1)*16+actions.length-1//竖线边距加自身宽度
        const paddingWidth=32//左右边距16px,总共32
        return `${btnStrs.length*14+paddingWidth+dividerWidth}px`//一个文字14px,左右边距16px
      }
    },
    initPaginationAttrs(){
      const {total=0,pageSize=20,pageNum=1,...paginAttrs}=this.paginationAttrs
      this.paginProps={
        total:total,
        pageSize:pageSize,
        pageNum:~~this.$route.query.pageNum||pageNum
      }
      this.paginAttrs=paginAttrs
    },
    doLayout:debounce(function(){
      this.$nextTick(()=>{
        this.$refs.tablePro && this.$refs.tablePro.doLayout()
      })
    },200),
    // 搜索
    search(){
      this.paginProps.pageNum=1
      this.getTableData()
    }
    // 刷新
    refresh(){
      this.getTableData()
    },
    // 将table实例暴露给用户
    getTableComp(){
      return this.$refs.tablePro
    },
    // 数据加入首行请求方法
    headRefresh(param){
      this.getTableData(param)
    },
    // 获取数据
    async getTableData(param={}){
      try{
       this.tableLoading=true
       const query={
         current:this.paginProps.pageNum,
         size:this.paginProps.pageSize
      }
      // 用户自己穿了数据就不再请求数据了
      if(this.data)return
      // 调用用户请求数据的方法
      const result=await this.fetch({...query,...param})
      if(result){
        this.tableData=result.data
        this.paginProps.total=result.total
      }else{
        this.paginProps.total=0
        this.tableData=[]
      }
      this.doLayout()
      }catch(error){
        if(this.paginProps.pageNum===1){
          this.paginProps.total=0
          this.tableData=[]
          this.$message.error(error.message)
        }else{
          // 如果当前不是第一页，返回第一页，如果还报错就抛出异常，为了处理删除整页数据后端报错的问题
          this.search()
        }

      }finally{
        this.tableLoading=false
      }
    },
    // 分页
    async handlePaginChang({pageNum,pageSize}){
      this.paginProps.pageSize=pageSize
      this.paginProps.pageNum=pageNum
      await this.getTableData()
      // 分页后滚动条恢复到顶部
      if(this.$refs.tablePro)this.$refs.tablePro.bodyWrapper.scrollTop=0
    },
    //展开全部列
    handleMore(){
      this.more=!this.more
      if(this.indeterminableHead&&!this.more){
        this.tableColumns=this.columns.filter((col,index=>index<this.indeterminableHead||col.type==='operat'))
      }else{
        this.tableColumns=[...this.columns]
      }
      this.doLayout()
    },
    slotBind(item){
      const {slot,...newItem}=item
      return newItem
    },
    showOverflowTooltip(item){
      const {showOverflowTooltip}=item
      return showOverflowTooltip!==undefined? showOverflowTooltip:true
    }
  }
}
</script>
<style lang="less" scoped>
.table-col-header{
  dispaly:flex;
  justify-content:space-between;
  align-items:center;
}
.footer{
  margin-top:16px;
  justify-content:flex-end;
  position:relative;
}
.el-container{
  flex-direction:column !important;
}
:deep(.hi-icon-setting){
  cursor:pointer;
}
:deep(.el-main){
  padding:0px;
}
/* 设置复选框为块元素，避免被覆盖 */
:deep(th .el-table-column--selection > .cell){
  padding:0 6px 0 16px
}
/* 操作列边距规范 */
:deep(.operat-column>.cell){
  padding:0 16px
}
.APP-TABLE-PRO__MAIN{
  position:relative;
  .APP_NULL_DATA_WRAP{
    position:absolute;
    top:0;
    left:50%;
    transform:translateX(-50%);
  }
}
</style>

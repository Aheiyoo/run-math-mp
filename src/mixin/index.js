// import runLoading from '@/components/run-loading'
import { sleep } from '@/utils'
import * as api from '@/http/api'
export const mixinShow = {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      selfShow: this.show
    }
  },
  watch: {
    show (v) {
      this.selfShow = v
    },
    selfShow (v) {
      this.$emit('update:show', v)
    }
  }
}

export const mixinPullToRefresh = {
  components: {
    // runLoading
  },
  data () {
    return {
      // loadingState: 0, // 0:不可见 1:正在加载 2:全部加载完毕 3:异常
      pageIndex: 0
    }
  },
  computed: {
    pages () {
      let result = []
      for (let i = 0; i < this.pageSum; i++) {
        result.push({
          pageNum: 1, // 当前页
          pageSize: 10, // 一页多少条数据
          pageCount: 10, // 一共多少页
          list: []
        })
      }
      return result
    },
    activePage () {
      return this.pages[this.pageIndex]
    },
    activeApi () {
      return this.apis[this.pageIndex]
    }
  },
  methods: {
    async fetchList (isRefresh = true) {
      if (isRefresh) {
        this.activePage.pageNum = 1
        this.activePage.pageCount = 0
      } else {
        this.activePage.pageNum += 1
        if (this.activePage.pageNum > this.activePage.pageCount) {
          // todo 数据已经请求到了最后一页
          this.loadingState = 2
          this.activePage.pageNum -= 1
          return
        }
      }
      let params = {
        pageNum: this.activePage.pageNum,
        pageSize: this.activePage.pageSize,
        ...this.params
      }
      // 开始请求
      console.log('请求礼物列表的参数', params)
      this.loadingState = 1
      try {
        const result = await api[this.activeApi](params)
        console.log(this.activeApi, result)
        this.activePage.list = isRefresh ? result.data : [...this.activePage.list, ...result.data]
        this.activePage.pageCount = result.pageCount
        this.loadingState = 0
      } catch (e) {
        console.log(e)
        this.loadingState = 3
      }
    }
  },
  async onPullDownRefresh () { // 下拉刷新
    console.log('下拉刷新')
    await this.fetchList()
    wx.stopPullDownRefresh()
  },
  async onReachBottom () { // 上拉加载
    console.log('上拉加载')
    await this.fetchList(false)
  },
  async mounted () {
    await sleep(50)
    wx.startPullDownRefresh()
  }
}

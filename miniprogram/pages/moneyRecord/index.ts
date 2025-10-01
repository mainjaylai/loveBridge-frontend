import { getMoneyRecord } from '../../api/user';
import { TYPE_MAP } from '../../const/payment';


Page({
  data: {
    records: [] as MoneyRecord[],
    loading: true
  },

  onLoad() {
    this.fetchRecords();
  },

  onPullDownRefresh() {
    this.fetchRecords();
  },

  fetchRecords() {
    this.setData({ loading: true });
    getMoneyRecord()
      .then((res: any) => {
        const records = res.data.data.map((item: MoneyRecord) => {
          // 格式化金额，从分转为元
          const formattedAmount = (item.amount / 100).toFixed(2);
          const formattedBalance = (item.balance / 100).toFixed(2);
          
          // 格式化日期，只显示到日
          const date = new Date(item.createdAt);
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          
          // 获取交易类型文本
          const typeText = TYPE_MAP[item.type] || '其他';
          
          // 确定交易类型样式类名
          let typeClass = '';
          if (item.type <= 3) {
            typeClass = 'income-type';
          } else {
            typeClass = 'expense-type';
          }
          
          return {
            ...item,
            formattedAmount,
            formattedBalance,
            formattedDate,
            typeText,
            typeClass
          };
        });
        
        this.setData({
          records,
          loading: false
        });
      })
      .catch((error: any) => {
        console.error('获取明细记录失败', error);
        this.setData({ loading: false });
      })
      .finally(() => {
        wx.stopPullDownRefresh();
      });
  }
}); 
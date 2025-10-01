Component({
  properties: {
    value: {
      type: String,
      value: "",
      observer(newVal) {
        this.setData({ inputValue: newVal });
      },
    },
    placeholder: {
      type: String,
      value: "请输入搜索关键词",
    },
    background: {
      type: String,
      value: "#ffffff",
    },
    shape: {
      type: String,
      value: "square",
    },
    actionText: {
      type: String,
      value: "搜索",
    },
    showAction: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    inputValue: "",
    focused: false,
  },

  methods: {
    // 输入框内容变化
    onInput(event) {
      const value = event.detail.value;
      this.setData({ inputValue: value });
      this.triggerEvent("change", value);
    },

    // 点击搜索按钮或回车
    onSearch() {
      this.triggerEvent("search", this.data.inputValue);
    },

    // 点击取消按钮
    onCancel() {
      this.triggerEvent("cancel");
    },

    // 获得焦点
    onFocus() {
      this.setData({ focused: true });
      this.triggerEvent("focus");
    },

    // 失去焦点
    onBlur() {
      this.setData({ focused: false });
      this.triggerEvent("blur");
    },

    // 清空输入
    onClear() {
      this.setData({ inputValue: "" });
      this.triggerEvent("change", "");
    },
  },
});

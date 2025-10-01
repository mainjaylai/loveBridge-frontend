interface DataOptions {
  latitude: number;
  longitude: number;
  name: string;
}

Page({
  data: {
    options: {
      latitude: 0,
      longitude: 0,
    } as DataOptions,
    marker: {
      id: 1,
      latitude: 0,
      longitude: 0,
      iconPath: "https://mmbiz.qpic.cn/mmbiz_jpg/cBNNH55ySxbSKNFKJUiaZvSDIH3YFiaIcI67b2lSGKBiawO658IjApQ4oYKbn5hHtSnvibPUXN0gRjrZicqfShOLic8g/640?wx_fmt=jpeg&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1",
      callout: {}
    }
  },
  onLoad(options: any) {
    this.setData({ 
      options, 
      marker: {
        ...this.data.marker,
        latitude: options.latitude,
        longitude: options.longitude,
        callout: {
          content: options.name,
          color: '#000000',
          fontSize: 14,
          // borderWidth: 2,
          borderRadius: 10,
          borderColor: '#000000',
          bgColor: '#fff',
          padding: 5,
          display: 'ALWAYS',
          textAlign: 'center'
        },
      }
    });
  }
});

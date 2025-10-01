import dayjs from "dayjs";
import { numberToZh } from "./const";

// 输出：2月1日 周六 ——订单团期、确认订单团期使用
export const formatTime1 = (unix: string) => {
  const date = dayjs(unix);
  return `${date.format("MM月DD日")} ${numberToZh[date.day()]}`;
};

// 输出：2025-01-06(周六) ——订单列表使用
export const formatTime2 = (unix: string) => {
  const date = dayjs(unix);
  return `${date.format("YYYY-MM-DD")}(${numberToZh[date.day()]})`;
};

// 输出：2025-01-06 12:00:00 ——下单时间，发帖时间使用
export const formatTime3 = (unix: string) => {
  const date = dayjs(unix);
  return `${date.format("YYYY-MM-DD HH:mm:ss")}`;
};

// 输出：2025-01-06 ——优惠券使用
export const formatTime4 = (unix: string) => {
  const date = dayjs(unix);
  return `${date.format("YYYY-MM-DD")}`;
};

// 输出：01月06日 周六 或 01月06日 - 01月08日 ——官方活动团期使用
export const formatTime5 = (sDate: string, eDate: string) => {
  const startDate = dayjs(sDate);
  const endDate = dayjs(eDate);
  if (startDate.isSame(endDate, "day")) {
    return `${startDate.format("MM月DD日")} ${numberToZh[startDate.day()]}`;
  }
  return `${startDate.format("MM月DD日")} - ${endDate.format("MM月DD日")}`;
};

// 输出：周三02.26 09:30
export const formatTime6 = (unix: string | number) => {
  const date = dayjs(unix);
  return `${numberToZh[date.day()]}${date.format("MM.DD HH:mm")}`;
};

// 输出：周三02.26
export const formatTime7 = (unix: string | number) => {
  const date = dayjs(unix);
  return `${numberToZh[date.day()]}${date.format("MM.DD")}`;
};

// 返回deadline最接近当前的团期
export const findClosestToNow = (
  objects: TourSchedule[],
  timestampKey: "deadline"
) => {
  if (!objects || objects.length === 0) return null;
  const now = dayjs();
  // 按时间差升序排序，第一个就是最接近现在的
  return [...objects].sort((a, b) => {
    const diffA = Math.abs(dayjs(a[timestampKey]).diff(now));
    const diffB = Math.abs(dayjs(b[timestampKey]).diff(now));
    return diffA - diffB;
  })[0];
};

// 根据closestTourDDL排序。如果在当前时间之后，则从小到大排，如果在当前时间之前则从大到小排
export const sortEvents = (events: Activity[]) => {
  const now = dayjs();

  return events.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    const aStart = dayjs(a.closestTourDDL);
    const bStart = dayjs(b.closestTourDDL);

    const aIsFuture = aStart.isAfter(now);
    const bIsFuture = bStart.isAfter(now);

    // 如果两个事件都在未来，按开始时间升序排列
    if (aIsFuture && bIsFuture) {
      return aStart.diff(bStart);
    }

    // 如果两个事件都在过去，按开始时间降序排列
    if (!aIsFuture && !bIsFuture) {
      return bStart.diff(aStart);
    }

    // 如果一个在未来一个在过去，未来的排在前面
    return aIsFuture ? -1 : 1;
  });
};

// 判断一个unix时间戳对比此刻是否未过期，未过期返回true，过期返回false，精确到分
export const judgeIsValid = (unix: string) => {
  return !dayjs().isAfter(dayjs(unix), "minute");
};

// 输出一个时间点距离当前时间点的时间，举例：刚刚 2分钟 2小时 2天 2月 2年
export const formatTime10 = (unix: string) => {
  const now = dayjs(); // 当前时间
  const targetTime = dayjs(unix); // 目标时间
  const diffInMinutes = now.diff(targetTime, "minute"); // 相差的分钟数
  const diffInHours = now.diff(targetTime, "hour"); // 相差的小时数
  const diffInDays = now.diff(targetTime, "day"); // 相差的天数
  const diffInMonths = now.diff(targetTime, "month"); // 相差的月数
  const diffInYears = now.diff(targetTime, "year"); // 相差的年数
  if (diffInMinutes < 1) {
    return "刚刚";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  } else if (diffInDays < 30) {
    return `${diffInDays}天前`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths}个月前`;
  } else {
    return `${diffInYears}年前`;
  }
};

// 将时间戳转换为YYYY-MM-DD格式
export const formatTime11 = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 将时间戳转换为**年格式
export const formatTime12 = (timestamp: number) => {
  if (!timestamp) return "**年";
  const date = new Date(timestamp);
  return String(date.getFullYear()).slice(2) + "年";
};

// return a-b
export const subtraction = (a: number, b?: number) => {
  if (b) {
    return Math.max(a - b * 100, 0);
  }
  return a;
};

// queryString 解析为对象
export const parseQueryString = (queryString: string) => {
  // 如果传入的字符串为空，直接返回空对象
  if (!queryString) return {};

  // 将字符串按 & 分割成键值对数组
  const pairs = queryString.split("&");

  // 初始化结果对象
  const result: { [key: string]: string } = {};

  // 遍历键值对数组
  pairs.forEach((pair) => {
    // 将每个键值对按 = 分割成键和值
    const [key, value] = pair.split("=");

    // 如果键和值都存在，将其添加到结果对象中
    if (key && value !== undefined) {
      // 使用 decodeURIComponent 解码键和值
      result[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });

  return result;
};

// 校验手机号
export const validatePhoneNumber = (phone: string): boolean => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

// 校验身份证号
export const validateIdCard = (idCard: string): boolean => {
  // 18位
  if (idCard.length !== 18) {
    return false;
  }
  // 17位数字 + 数字/X
  const reg = /(^\d{17}(\d|X|x)$)/;
  if (!reg.test(idCard)) {
    return false;
  }

  // 18位身份证号校验规则
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]; // 权重
  const checkCodes = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"]; // 校验码

  // 计算校验码
  const first17 = idCard.slice(0, 17);
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(first17.charAt(i)) * weights[i];
  }
  const mod = sum % 11;
  const checkCode = checkCodes[mod];

  // 校验最后一位
  const lastChar = idCard.charAt(17).toUpperCase();
  return lastChar === checkCode;
};

// 校验护照号
export const validatePassport = (passport: string): boolean => {
  return /^[A-Z0-9]{6,9}$/.test(passport);
};

// 判断证件类型：根据证件号码判断是身份证还是护照
export const checkCredentialType = (idCard: string): "idcard" | "passport" => {
  // 判断是否为身份证格式（18位）
  if (idCard.length === 18 && /^\d{17}[\dXx]$/.test(idCard)) {
    return "idcard";
  }
  // 判断是否为护照格式
  if (/^[a-zA-Z]{1,2}\d{7,8}$/.test(idCard)) {
    return "passport";
  }
  // 默认当作身份证处理
  return "idcard";
};

export const formatTime = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join("/") +
    " " +
    [hour, minute, second].map(formatNumber).join(":")
  );
};

const formatNumber = (n: number) => {
  const s = n.toString();
  return s[1] ? s : "0" + s;
};

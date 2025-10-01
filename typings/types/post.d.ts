// TODO: 你自己定义的 location，自己补充,记得先 json.parse 一下
interface Location {
  latitude: number;
  longitude: number;
}

interface Comment {
  id: number;
  userId: number;
  user: User;
  postId: number;
  post: Post;
  parentCommentId: number | null;
  parentComment: Comment | null;
  replyCommentId: number | null;
  replyComment: Comment | null;
  replyUserId: number | null;
  replyUser: User | null;
  content: string;
  image: string;
  voice: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  isLiked: boolean;
  subComments: Comment[]; // 子评论数组
  showAllSubComments?: boolean; // 是否显示所有子评论
  replyToUser?: User | null; // 界面显示用，被回复的用户
  voiceDuration?: number; // 语音时长
}

interface Post {
  id: number;
  userId: number;
  user: User;
  content: string;
  location: Location;
  tags: string; // 多个标签用;分隔
  images: string[]; // 图片 url 数组
  likesCount: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  isLiked: boolean;
}

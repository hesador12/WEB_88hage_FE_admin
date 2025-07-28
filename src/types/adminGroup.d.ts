export interface GroupListItem {
  id: number;
  title: string;
  leaderEmail: string;
  createdAt: string;
  status: '모집중' | '모집 마감' | '완료된 모임' | '삭제된 모임';
}

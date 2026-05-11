import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/user";
import { toast } from "sonner";

/**
 * 유저 프로필 정보를 가져오는 훅
 */
export function useProfile(uid: string | undefined) {
  return useQuery({
    queryKey: ["profile", uid],
    queryFn: () => (uid ? getUserProfile(uid) : null),
    enabled: !!uid,
  });
}

/**
 * 유저 프로필 정보를 업데이트하는 훅
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<UserProfile> }) =>
      updateUserProfile(uid, data),
    onSuccess: (_, variables) => {
      // 업데이트 성공 시 프로필 캐시 무효화 -> 최신 데이터 다시 가져옴
      queryClient.invalidateQueries({ queryKey: ["profile", variables.uid] });
      toast.success("프로필이 업데이트되었습니다.");
    },
    onError: () => {
      toast.error("프로필 업데이트에 실패했습니다.");
    },
  });
}

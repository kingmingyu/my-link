import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLinks, addLink, updateLink, deleteLink, LinkItem } from "@/lib/link";
import { toast } from "sonner";

/**
 * 링크 목록을 가져오는 훅
 */
export function useLinks(uid: string | undefined) {
  return useQuery({
    queryKey: ["links", uid],
    queryFn: () => (uid ? getLinks(uid) : []),
    enabled: !!uid,
  });
}

/**
 * 링크를 추가하는 훅
 */
export function useAddLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, link }: { uid: string; link: LinkItem }) => addLink(uid, link),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["links", variables.uid] });
      toast.success("링크가 추가되었습니다.");
    },
    onError: () => {
      toast.error("링크 추가에 실패했습니다.");
    },
  });
}

/**
 * 링크를 수정하는 훅
 */
export function useUpdateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, linkId, data }: { uid: string; linkId: string; data: Partial<LinkItem> }) =>
      updateLink(uid, linkId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["links", variables.uid] });
    },
    onError: () => {
      toast.error("링크 수정에 실패했습니다.");
    },
  });
}

/**
 * 링크를 삭제하는 훅
 */
export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, linkId }: { uid: string; linkId: string }) => deleteLink(uid, linkId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["links", variables.uid] });
      toast.success("링크가 삭제되었습니다.");
    },
    onError: () => {
      toast.error("링크 삭제에 실패했습니다.");
    },
  });
}

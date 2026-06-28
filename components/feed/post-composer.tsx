"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type PostResult = { ok?: boolean; postId?: string; parentId?: string | null; needLogin?: boolean; error?: boolean } | void;

type PostComposerProps = {
  action: (formData: FormData) => Promise<PostResult>;
  parentId?: string;
  placeholder?: string;
  submitLabel?: string;
};

export function PostComposer({
  action,
  parentId,
  placeholder = "What are your agents thinking?",
  submitLabel = "Post",
}: PostComposerProps) {
  const [content, setContent] = useState("");
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const remaining = 500 - content.length;

  function onChange(value: string) {
    setContent(value.slice(0, 500));

    if (textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height = `${Math.min(textRef.current.scrollHeight, 240)}px`;
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (parentId) formData.set("parent_id", parentId);

    start(async () => {
      const res = await action(formData);

      if (res?.needLogin) {
        toast("Sign in to post", "error");
        router.push("/login");
        return;
      }
      if (res?.error || !res?.ok) {
        toast("Couldn't post — try again", "error");
        return;
      }

      setContent("");
      if (textRef.current) textRef.current.style.height = "auto";
      toast(parentId ? "Reply posted" : "Posted");

      const dest = parentId ? `/post/${res.parentId}` : res.postId ? `/post/${res.postId}` : "/";
      router.push(dest);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <Textarea
        ref={textRef}
        name="content"
        value={content}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] resize-none border-0 p-0 text-base shadow-none focus:ring-0"
      />

      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <span className={remaining < 30 ? "text-xs text-rose-500" : "text-xs text-zinc-500"}>
          {remaining} chars left
        </span>
        <Button type="submit" disabled={pending || !content.trim() || content.length > 500}>
          {pending ? (parentId ? "Replying…" : "Posting…") : submitLabel}
        </Button>
      </div>
    </form>
  );
}

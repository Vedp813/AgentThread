"use client";

import { useMemo, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";

type PostComposerProps = {
  action: (formData: FormData) => void | Promise<void>;
  redirectPath: string;
  parentId?: string;
  placeholder?: string;
  submitLabel?: string;
};

export function PostComposer({
  action,
  redirectPath,
  parentId,
  placeholder = "What are your agents thinking?",
  submitLabel = "Post",
}: PostComposerProps) {
  const [content, setContent] = useState("");
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const remaining = useMemo(() => 500 - content.length, [content.length]);

  function onChange(value: string) {
    setContent(value.slice(0, 500));

    if (textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height = `${Math.min(textRef.current.scrollHeight, 240)}px`;
    }
  }

  return (
    <form action={action} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {parentId ? <input type="hidden" name="parent_id" value={parentId} /> : null}
      <input type="hidden" name="redirect_path" value={redirectPath} />

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
        <SubmitButton disabled={!content.trim() || content.length > 500} pendingLabel="Posting…">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ActionTooltip } from "../action-toolkit";

export const DirectMessage = () => {
  const router = useRouter();
  const onClick = () => {
    router.push(`/directMessages/`)
}


  return (
    <ActionTooltip side="right" align="center" label="Direct Message">
      <img
        src="/directMessage.png"
        alt="logo"
        width="100px"
        height="100px"
        className="hover:cursor-pointer"
        onClick={onClick}
      />
    </ActionTooltip>
  );
};

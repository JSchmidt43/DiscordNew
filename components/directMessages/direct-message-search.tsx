"use client"

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { CommandDialog, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "../ui/command";
import { useParams, useRouter } from "next/navigation";
import { DialogTitle } from "../ui/dialog";

interface DirectMessageSearchProps {
    data: {
        label: string;
        type: "friends",
        data: {
            image: string;
            name: string;
            id: string;
        }[] | undefined
    }[]
}

export const DirectMessageSearch = ({
    data
}: DirectMessageSearchProps) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const onClick = ({ id, type }: { id: string, type: "friends" }) => {
        setOpen(false);

        if (type === "friends") {
            return router.push(`/directMessages/${id}`);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
            >
                <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
                    Search
                </p>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
                    <span className="text-xs">ctrl</span>+ K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <DialogTitle />
                <CommandInput placeholder="Search all friends" />
                <CommandList>
                    <CommandEmpty>No Results found</CommandEmpty>
                    {data.map(({ label, type, data }) => {
                        if (!data?.length) return null;
                        return (
                            <CommandGroup key={label} heading={label}>
                                {data?.map(({ id, image, name }) => {
                                    return (
                                        <CommandItem
                                            key={id}
                                            className="hover:cursor-pointer flex items-center gap-x-3 py-1"
                                            onSelect={() => onClick({ id, type })}
                                        >
                                            {/* Adjust the image size */}
                                            <img
                                                src={image}
                                                alt={name}
                                                width={30}   // Set width
                                                height={30}  // Set height
                                                className="rounded-full"  // Optional: Make image circular
                                            />
                                            <span>{name}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        );
                    })}
                </CommandList>
            </CommandDialog>
        </>
    );
};

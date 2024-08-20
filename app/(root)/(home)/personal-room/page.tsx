"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useGetCallBYId } from "@/hooks/useGetCallById";
import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import React from "react";

const Table = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex flex-col item-start gap-2 xl:flex-row">
    <h1 className="text-base font-medium text-sky-1 lg:text-xl xl:min-w-32">
      {title}:{" "}
    </h1>
    <h1 className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl">
      {description}
    </h1>
  </div>
);

const PersonalRoom = () => {
  const { user } = useUser();
  const { toast } = useToast();

  const client = useStreamVideoClient();
  const router = useRouter();

  const meetingId = user?.id;
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`;

  const { call } = useGetCallBYId(meetingId!);

  const startRoom = async () => {
    if (!client || !user) return;
    try {
      const newCall = client.call("default", meetingId!);

      if (!call) throw new Error("Failed to create meeting");

      await newCall.getOrCreate({
        data: {
          starts_at: new Date(Date.now()).toISOString(),
        },
      });
      router.push(`/meeting/${meetingId}?personal=true`);
      toast({ title: "Meeting Created" });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to create Meeting" });
    }
  };

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <h1 className="text-3xl font-bold">Personal Room</h1>
      <div className="flex w-full flex-col gap-8 xl:max-w-[900px]">
        <Table title="Topic" description={`${user?.username}'s Meeting Room`} />
        <Table title="Meeting ID" description={meetingId!} />
        <Table title="Meeting Link" description={meetingLink} />
      </div>
      <div className="flex gap-5">
        <Button className="bg-blue-1" onClick={startRoom}>
          Start Meeting
        </Button>
        <Button
          className="bg-dark-3"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({
              title: "Link Copied",
            });
          }}
        >
          Copy Invitation
        </Button>
      </div>
    </section>
  );
};

export default PersonalRoom;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

export default async function SlugChatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main>
      <div className="w-4/5 mx-auto overflow-y-scroll h-[80vh] my-4">
        <div className="container flex flex-col">
          <div className="text-xl inline-block p-4 my-4 rounded-sm bg-gray-200 self-start">
            Hi I am Llama
          </div>
          <div className="text-xl p-4 my-4 rounded-sm bg-gray-200 self-end text-right inline-block">
            Hi I am Llama
          </div>
          <div className="text-xl inline-block p-4 my-4 rounded-sm bg-gray-200 self-start">
            Hi I am Llama
          </div>
          <div className="text-xl inline-block p-4 my-4 rounded-sm bg-gray-200 self-start">
            Hi I am Llama
          </div>
          <h2 className="text-4xl">{slug}</h2>
        </div>
      </div>
      <div className="w-4/5 mx-auto resize-none flex flex-col my-4">
        <Textarea
          rows={2}
          className="bg-white resize-none shadow-md"
        ></Textarea>
        <div className="flex justify-between py-2 mx-4">
          <Button className="bg-blue-400 rounded-4xl h-[40px] w-[40px]">
            +
          </Button>
          <Input type="file" hidden />
          <Button className="bg-blue-400 rounded-4xl h-[40px] w-[40px]">
            HI
          </Button>
        </div>
      </div>
    </main>
  );
}

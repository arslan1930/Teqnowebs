"use client";

import dynamic from "next/dynamic";

const TasksInner = dynamic(() => import("./page-inner"), { ssr: false });

export default function TasksPage() {
  return <TasksInner />;
}

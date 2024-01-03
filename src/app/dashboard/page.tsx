import TopicCreateForm from "~/app/_components/forms/topic-create-form";
import MyTopics from "src/app/_components/MyTopics";
import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="fixed top-0 flex h-20 w-screen  items-center gap-6 bg-neutral-900 p-4">
        <h1 className="flex-grow text-2xl font-bold text-primary-foreground">
          Dashboard
        </h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      <MyTopics />
      <TopicCreateForm />
    </main>
  );
}

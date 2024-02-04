import { type TopicSessionSlice } from "../calendar-grid-definitions";
import { CalendarGridTopicSessionOptionsUpdateForm } from "./calendar-grid-topic-session-options-update-form";

export default function CalendarGridTopicSessionOptions({
  topicSessionSlice,
}: {
  topicSessionSlice: TopicSessionSlice;
}) {
  return (
    <div className="flex flex-col rounded-lg p-1 ">
      <CalendarGridTopicSessionOptionsUpdateForm
        topicSessionSlice={topicSessionSlice}
      />
    </div>
  );
}

import { useUserPreferences } from "~/app/hooks/use-user-preferences";

// Render out a div containing the span of time a session lasted for (or if it's ongoing, a green dot)
export function CalendarGridTopicSessionTimespan({
  sessionStartTimeMS,
  sessionEndTimeMS,
}: {
  sessionStartTimeMS: number;
  sessionEndTimeMS: number | null;
}) {
  // Get the date time format options from user preferences
  const { dateTimeFormatOptions } = useUserPreferences();

  return (
    <p className="font-bold">
      {new Date(sessionStartTimeMS).toLocaleTimeString(
        "en-us",
        dateTimeFormatOptions,
      )}{" "}
      -{" "}
      {sessionEndTimeMS ? (
        new Date(sessionEndTimeMS).toLocaleTimeString(
          "en-us",
          dateTimeFormatOptions,
        )
      ) : (
        <div className="flex flex-row items-center gap-2">
          Ongoing <span className="h-4 w-4 rounded-full bg-green-500"></span>
        </div>
      )}
    </p>
  );
}

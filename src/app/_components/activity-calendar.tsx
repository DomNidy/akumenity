import { api } from "~/trpc/react"

export default function ActivityCalender() {
    const topicSessions = api.topicSession.getTopicSessionsInDateRange.useQuery({
        dateRange: {
            startTimeMS: Date.now() - 7 * 24 * 60 * 60 * 1000
        }
    }, {
        enabled: false // Prevent automatic fetching
    })

    // TODO: Begin implementing the calender
    return <div>
        <h1>Activity Calender</h1>

        {topicSessions.data?.map((session) => {
            return <div className="">{session.Topic_Title}</div>
        })}
    </div>
}
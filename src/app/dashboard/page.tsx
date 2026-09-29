import { getSessions, SessionInterface } from '../../actions/sessions'

export default async function Home() {
    const sessions = await getSessions();
    return (
        <div>
            <h1>Sessions</h1>
            <div>{sessions?.map((session: SessionInterface) => <p key={session.id}>{session.title}<br></br>{session.instructor_id}</p>)}</div>
        </div>
    )
}


import App from "./App.tsx";
import {UserProvider} from "./lib/user-context.tsx";
import {useUser} from "./lib/use-user.tsx";

export default function Wrapper() {
    const context = useUser();

    return (
        <>
            <UserProvider value={context}>
                <App/>
            </UserProvider>
        </>
    )
}
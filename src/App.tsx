import { LoginPage } from "./views/login-page";
import { Layout } from "./layout";

import './App.css'

function App() {
    return (
        <main id="center" data-test='main-app-container'>
            <Layout>
                < LoginPage/>
            </Layout>
        </main>
    )
}

export default App

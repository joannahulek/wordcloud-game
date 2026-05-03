import { HomePage } from './views/home-page'
import { Layout } from "./layout";

import './App.css'

function App() {
  return (
    <main id="center" data-test='main-app-container'>
        <Layout>
            <HomePage />
        </Layout>
    </main>
  )
}

export default App

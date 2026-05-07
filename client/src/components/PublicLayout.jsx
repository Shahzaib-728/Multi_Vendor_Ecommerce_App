import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import SupportChat from './SupportChat'

export default function PublicLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-16">
                <Outlet />
            </main>
            <SupportChat />
            <Footer />
        </div>
    )
}

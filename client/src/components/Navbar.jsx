
function Navbar() {
    return (
        <nav className="navbar">
            <a href="#home" className="brand">
                <div className="brand-icon">
                    <svg viewBox="0 0 40 40" fill="none">
                        <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
                            stroke="currentColor" strokeWidth="2.5"/>
                        <path d="M12 21L18 27L29 14"
                            stroke="#16A36A" strokeWidth="3"
                            strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <span>Civic<span className="brand-green">Track</span></span>
            </a>

            <div className="nav-links">
                <a href="#home">Home</a>
                <a href="#categories">Explore Issues</a>
                <a href="#how-it-works">How it works</a>
            </div>

            <a href="#report" className="nav-button">
                Report an Issue <span>↗</span>
            </a>
        </nav>
    );
}

export default Navbar;

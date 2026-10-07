// import facultyBg from "../../assets/faculty-bg.jpeg"; // Replace with your Faculty Connect bg image
import Footer from "../../components/footer";
const ComingSoon = () => {
    return (
        <>
        <div className="relative h-screen w-screen">
            {/* Background image */}
            {/* <img
                className="h-screen w-screen object-cover brightness-40"
                src={none}
                alt="Faculty Connect Coming Soon"
            /> */}

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 sm:gap-10 px-4 text-center">
                
                {/* Title */}
                <h1 className="text-5xl sm:text-7xl md:text-9xl font-extrabold text-yellow-500">
                    Faculty Connect
                </h1>

                {/* Divider */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 w-full max-w-xl">
                    <div className="border-2 border-yellow-300 flex-1"></div>
                    <div className="p-2 sm:p-4">
                        <p className="text-4xl sm:text-5xl md:text-7xl font-bold text-white">
                            Coming Soon
                        </p>
                    </div>
                    <div className="border-2 border-yellow-300 flex-1"></div>
                </div>

                {/* Description */}
                <p className="text-white text-lg sm:text-xl md:text-2xl max-w-2xl">
                    A platform to connect faculty, students, and projects seamlessly.
                </p>
                <p className="text-white text-lg sm:text-xl md:text-2xl max-w-2xl">
                    Stay tuned for the launch! 🚀
                </p>
            </div>
        </div>
        <Footer />
        </>
    );
};

export default ComingSoon;

const healthCheck = (req, res) => {
    res.status(200).json({
        success: true,
        message: "VidTube Backend is running 🚀",
        timestamp: new Date()
    });
};

export { healthCheck };
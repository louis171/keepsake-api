multerErrorHandler = (err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(500).json({ err: "Multer error", code: "err.code" })
    }
}

module.exports = multerErrorHandler;
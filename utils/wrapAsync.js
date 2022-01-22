module.exports = fn => {
    return function(req, res, next){
        fn(req, res, next).catch(e => next(e));//catch errors thrown by mongoose or by AppError
    }
}
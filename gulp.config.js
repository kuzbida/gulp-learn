module.exports = function(){
    var client = './src/client/';

    var config = {
        temp: './.tmp/',
        alljs: [client+'**/*.js', '*.js'],
        less: client+'styles/styles.less'
    };

    return config;
};

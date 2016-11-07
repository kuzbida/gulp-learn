module.exports = function () {
    var client = './src/client/',
        clientApp = client + 'app/',
        temp = './.tmp/';

    var config = {
        temp: temp,
        client: client,
        index: client + 'index.html',
        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js' /*TO EXCLUDE SOME FILES*/
        ],
        alljs: [
            client + '**/*.js',
            '*.js'
        ],
        css: temp + 'styles.css',
        less: client + 'styles/styles.less',
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../..'
        },
        getWiredepDefaultOptions: getWiredepDefaultOptions
    };

    function getWiredepDefaultOptions() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        }
    }

    return config;
};

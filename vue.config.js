module.exports = {
  'publicPath': '/dev/',
  devServer: {
    'useLocalIp': false,
    'public': 'tabletalk.anthonybau.com',
    'proxy': {
      '/http-bind': {
	target: 'http://tabletalk.anthonybau.com'
      }
    }
  }
}

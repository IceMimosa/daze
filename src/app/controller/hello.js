
const {
  Controller, Http, Route,
} = require('@dazejs/framework');

@Route()
class Hello extends Controller {
  @Http.Get()
  index() {
    return this.render('hello', {
      name: 'Daze.js',
    });
  }
}


module.exports = Hello;


const Koa = require('koa');
const Router = require('koa-router')

const app = new Koa()

const router = new Router()

const controller = (ctx, next) => {
  ctx.body = 'Hello World'
}

for (let index1 = 1; index1 <= 10; index1++) {
  for (let index2 = 1; index2 <= 10; index2++) {
    for (let index3 = 1; index3 <= 10; index3++) {
      const url = `/uuid${index1}/uuid${index2}/uuid${index3}`
      router.get(url, controller)
    }
  }
}

app.use(router.routes(), router.allowedMethods())

app.listen(3000)
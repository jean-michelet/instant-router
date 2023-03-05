import Router from "../Router";

const router = new Router();

// Name the routes to use UrlGenerator
router.addNamedRoute('comment', {
  path: '/posts/:postId/comments/:commentId',
  methods: ['GET'],
  controller: () => {}
})

const url = router.generateUrl('comment', 
  { postId: 1, commentId: 10, foo: 4, bar: "hello "  }, 
  { isAbsolute: true }
)

// "http://localhost:3000/posts/1/comments/10?foo=10&bar="hello"
console.log(url); 
